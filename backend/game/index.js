import { WebSocketServer } from 'ws';

const games = {};
const questions = [
    { question: "What is 2 + 2?", answers: ["3", "4", "5", "6"], correct: 1 },
    { question: "What color is the sky?", answers: ["Red", "Green", "Blue", "Yellow"], correct: 2 },
    { question: "How many legs does a spider have?", answers: ["6", "8", "10", "4"], correct: 1 },
    { question: "What is the capital of France?", answers: ["London", "Berlin", "Paris", "Rome"], correct: 2 },
    { question: "What planet is closest to the sun?", answers: ["Venus", "Earth", "Mars", "Mercury"], correct: 3 },
    { question: "How many sides does a triangle have?", answers: ["2", "3", "4", "5"], correct: 1 },
    { question: "What is 10 x 10?", answers: ["10", "100", "1000", "110"], correct: 1 },
    { question: "Which animal says moo?", answers: ["Pig", "Cow", "Dog", "Cat"], correct: 1 },
    { question: "What is the largest ocean?", answers: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { question: "How many months are in a year?", answers: ["10", "11", "12", "13"], correct: 2 }
];

function makeCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function broadcast(game, msg) {
    for (const p of Object.values(game.players)) {
        if (p.ws && p.ws.readyState === 1) p.ws.send(JSON.stringify(msg));
    }
}

function nextQuestion(game) {
    const questionList = game.customQuestions || questions;
    if (game.questionIndex >= questionList.length) {
        endGame(game);
        return;
    }
    const q = questionList[game.questionIndex];
    game.answered = {};
    game.questionStart = Date.now();
    broadcast(game, { type: 'question', question: q.question, answers: q.answers, index: game.questionIndex, total: questionList.length });
    game.timer = setTimeout(() => {
        broadcast(game, { type: 'timeout', correct: q.correct });
        game.questionIndex++;
        setTimeout(() => nextQuestion(game), 3000);
    }, 15000);
}

function endGame(game) {
    const scores = Object.entries(game.players).map(([id, p]) => ({ username: p.username, score: p.score })).sort((a, b) => b.score - a.score);
    broadcast(game, { type: 'gameover', scores });
    // Award tokens to top players
    if (scores[0]) database.query('UPDATE users SET tokens = tokens + 100 WHERE username = ?', { replacements: [scores[0].username] }).catch(() => {});
    if (scores[1]) database.query('UPDATE users SET tokens = tokens + 50 WHERE username = ?', { replacements: [scores[1].username] }).catch(() => {});
    if (scores[2]) database.query('UPDATE users SET tokens = tokens + 25 WHERE username = ?', { replacements: [scores[2].username] }).catch(() => {});
    setTimeout(() => delete games[game.code], 30000);
}

export default function setupGame(wss) {
    wss.on('connection', (ws, req) => {
        if (req && req.url === '/chat') return;
        let playerId = null;
        let gameCode = null;

        ws.on('message', async (raw) => {
            let msg;
            try { msg = JSON.parse(raw); } catch { return; }

            if (msg.type === 'host') {
                const code = makeCode();
                const token = msg.token;
                const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
                if (!sessions.length) return ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
                const users = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
                if (!users.length) return ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
                playerId = users[0].id.toString();
                gameCode = code;
                games[code] = { code, host: playerId, players: {}, questionIndex: 0, answered: {}, state: 'lobby', setId: msg.setId || null };
                games[code].players[playerId] = { username: users[0].username, score: 0, ws };
                ws.send(JSON.stringify({ type: 'hosted', code, username: users[0].username }));
            }

            else if (msg.type === 'join') {
                const code = msg.code.toUpperCase();
                const game = games[code];
                if (!game) return ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
                if (game.state !== 'lobby') return ws.send(JSON.stringify({ type: 'error', message: 'Game already started' }));
                const token = msg.token;
                const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
                if (!sessions.length) return ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
                const users = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
                if (!users.length) return ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
                playerId = users[0].id.toString();
                gameCode = code;
                game.players[playerId] = { username: users[0].username, score: 0, ws };
                broadcast(game, { type: 'playerjoined', players: Object.values(game.players).map(p => ({ username: p.username, score: p.score })) });
                ws.send(JSON.stringify({ type: 'joined', code, username: users[0].username }));
            }

            else if (msg.type === 'start') {
                const game = games[gameCode];
                if (!game || game.host !== playerId) return;
                // Load custom set if specified
                if (game.setId) {
                    try {
                        const [set] = await database.query("SELECT * FROM sets WHERE id = ?", { replacements: [game.setId], type: database.QueryTypes.SELECT });
                        if (set) {
                            const qs = typeof set.questions === "string" ? JSON.parse(set.questions) : set.questions;
                            game.customQuestions = qs;
                        }
                    } catch(e) { console.error(e); }
                }
                game.state = 'playing';
                broadcast(game, { type: 'starting' });
                setTimeout(() => nextQuestion(game), 3000);
            }

            else if (msg.type === 'answer') {
                const game = games[gameCode];
                if (!game || game.state !== 'playing') return;
                if (game.answered[playerId]) return;
                game.answered[playerId] = true;
                const questionList = game.customQuestions || questions;
                const q = questionList[game.questionIndex];
                const correct = msg.answer === q.correct;
                const speed = Math.max(0, 15000 - (Date.now() - game.questionStart));
                const points = correct ? Math.floor(500 + (speed / 15000) * 500) : 0;
                game.players[playerId].score += points;
                ws.send(JSON.stringify({ type: 'answered', correct, points }));
                if (Object.keys(game.answered).length === Object.keys(game.players).length) {
                    clearTimeout(game.timer);
                    broadcast(game, { type: 'timeout', correct: q.correct, scores: Object.values(game.players).map(p => ({ username: p.username, score: p.score })) });
                    game.questionIndex++;
                    setTimeout(() => nextQuestion(game), 3000);
                }
            }
        });

        ws.on('close', () => {
            if (gameCode && games[gameCode] && playerId) {
                delete games[gameCode].players[playerId];
                if (Object.keys(games[gameCode].players).length === 0) delete games[gameCode];
                else broadcast(games[gameCode], { type: 'playerleft', players: Object.values(games[gameCode].players).map(p => ({ username: p.username, score: p.score })) });
            }
        });
    });
}
