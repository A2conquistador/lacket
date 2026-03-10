
const clients = new Set();

const BANNED_WORDS = [
    'nigger','nigga','faggot','fag','retard','chink','spic','kike','wetback','cunt',
    'fuck','shit','bitch','dick','cock','pussy','whore','slut','bastard','twat',
    'wank','arse','motherfucker','asshole','bullshit','tranny','dyke','gook',
    'rape','pedophile','pedo','nonce'
];

function filterMessage(content) {
    let filtered = content;
    for (const word of BANNED_WORDS) {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
    return filtered;
}

export function setupChat(wss) {
    wss.on('connection', (ws, req) => {
        if (!req || req.url !== '/chat') return;
        clients.add(ws);

        global.database.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50', { type: global.database.QueryTypes.SELECT })
            .then(msgs => {
                const filtered = msgs.reverse().map(m => ({ ...m, content: filterMessage(m.content) }));
                ws.send(JSON.stringify({ type: 'history', messages: filtered }));
            }).catch(() => {});

        ws.on('message', async (raw) => {
            let msg;
            try { msg = JSON.parse(raw); } catch { return; }

            if (msg.type === 'send') {
                const token = msg.token;
                if (!token) return;
                try {
                    const sessions = await global.database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: global.database.QueryTypes.SELECT });
                    if (!sessions.length) return;
                    const [user] = await global.database.query('SELECT id, username, role, banned FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: global.database.QueryTypes.SELECT });
                    if (!user || user.banned) return;
                    const raw_content = String(msg.content || '').trim().slice(0, 300);
                    if (!raw_content) return;
                    const content = filterMessage(raw_content);
                    await global.database.query('INSERT INTO messages (user_id, username, role, content) VALUES (?, ?, ?, ?)', { replacements: [user.id, user.username, user.role || 'Player', content] });
                    const broadcast = JSON.stringify({ type: 'message', message: { username: user.username, role: user.role || 'Player', content, created_at: new Date() } });
                    for (const client of clients) {
                        if (client.readyState === 1) client.send(broadcast);
                    }
                } catch(err) { console.error('chat error', err.message); }
            }

            if (msg.type === 'announce') {
                const token = msg.token;
                if (!token) return;
                try {
                    const sessions = await global.database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: global.database.QueryTypes.SELECT });
                    if (!sessions.length) return;
                    const [user] = await global.database.query('SELECT id, username, role FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: global.database.QueryTypes.SELECT });
                    if (!user || !['Dev','Admin'].includes(user.role)) return;
                    const content = String(msg.content || '').trim().slice(0, 500);
                    if (!content) return;
                    const broadcast = JSON.stringify({ type: 'announce', message: { username: user.username, role: user.role, content, created_at: new Date() } });
                    for (const client of clients) {
                        if (client.readyState === 1) client.send(broadcast);
                    }
                } catch(err) { console.error('announce error', err.message); }
            }
        });

        ws.on('close', () => clients.delete(ws));
    });
}
