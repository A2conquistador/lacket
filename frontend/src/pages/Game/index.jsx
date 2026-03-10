import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';

export default function Game() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState('menu');
    const [code, setCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [scores, setScores] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isHost, setIsHost] = useState(false);
    const [username, setUsername] = useState('');
    const ws = useRef(null);
    const timer = useRef(null);
    const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12'];

    useEffect(() => {
        return () => { if (ws.current) ws.current.close(); if (timer.current) clearInterval(timer.current); };
    }, []);

    const connect = (onOpen) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        ws.current = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host);
        ws.current.onopen = () => onOpen(token);
        ws.current.onmessage = (e) => handleMessage(JSON.parse(e.data));
        ws.current.onerror = () => alert('Connection error');
    };

    const handleMessage = (msg) => {
        if (msg.type === 'hosted') { setCode(msg.code); setUsername(msg.username); setPlayers([{ username: msg.username, score: 0 }]); setScreen('lobby'); setIsHost(true); }
        else if (msg.type === 'joined') { setUsername(msg.username); setScreen('lobby'); setIsHost(false); }
        else if (msg.type === 'playerjoined') { setPlayers(msg.players); }
        else if (msg.type === 'playerleft') { setPlayers(msg.players); }
        else if (msg.type === 'starting') { setScreen('starting'); }
        else if (msg.type === 'question') {
            setQuestion(msg); setSelected(null); setResult(null); setTimeLeft(15); setScreen('question');
            if (timer.current) clearInterval(timer.current);
            timer.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timer.current); return 0; } return t - 1; }), 1000);
        }
        else if (msg.type === 'answered') { setResult(msg); }
        else if (msg.type === 'timeout') { clearInterval(timer.current); setResult(r => r || { correct: false, points: 0 }); if (msg.scores) setPlayers(msg.scores); setScreen('between'); setTimeout(() => setScreen('question'), 3000); }
        else if (msg.type === 'gameover') { setScores(msg.scores); setScreen('gameover'); }
        else if (msg.type === 'error') { alert(msg.message); }
    };

    const host = () => connect((token) => ws.current.send(JSON.stringify({ type: 'host', token })));
    const join = () => connect((token) => ws.current.send(JSON.stringify({ type: 'join', code: joinCode, token })));
    const start = () => ws.current.send(JSON.stringify({ type: 'start' }));
    const answer = (i) => { if (selected !== null) return; setSelected(i); ws.current.send(JSON.stringify({ type: 'answer', answer: i })); };

    const s = {
        bg: { minHeight:'100vh', background:'#000030', color:'#fff', fontFamily:'Nunito,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px' },
        card: { background:'#000040', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'500px', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' },
        title: { fontFamily:'Titan One,sans-serif', fontSize:'48px', marginBottom:'30px', textAlign:'center' },
        btn: { background:'#000090', border:'none', color:'#fff', fontFamily:'Nunito,sans-serif', fontSize:'18px', fontWeight:'700', padding:'12px 30px', borderRadius:'8px', cursor:'pointer', width:'100%', marginTop:'10px' },
        input: { background:'#000060', border:'2px solid rgba(255,255,255,0.2)', borderRadius:'8px', color:'#fff', fontFamily:'Nunito,sans-serif', fontSize:'20px', padding:'12px', width:'100%', marginTop:'10px', boxSizing:'border-box', textAlign:'center', letterSpacing:'4px' }
    };

    if (screen === 'menu') return (
        <div style={s.bg}>
            <div style={s.title}>Classic Trivia</div>
            <div style={s.card}>
                <button style={s.btn} onClick={host}>Host a Game</button>
                <div style={{textAlign:'center',margin:'20px 0',color:'#888'}}>or</div>
                <input style={s.input} placeholder="ENTER CODE" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
                <button style={s.btn} onClick={join}>Join Game</button>
                <button style={{...s.btn,background:'transparent',border:'1px solid rgba(255,255,255,0.2)',marginTop:'20px'}} onClick={() => navigate('/dashboard')}>Back</button>
            </div>
        </div>
    );

    if (screen === 'lobby') return (
        <div style={s.bg}>
            <div style={s.title}>Lobby</div>
            <div style={s.card}>
                {isHost && <div style={{textAlign:'center',marginBottom:'20px'}}>
                    <div style={{color:'#888',fontSize:'14px'}}>Game Code</div>
                    <div style={{fontFamily:'Titan One,sans-serif',fontSize:'60px',letterSpacing:'8px',color:'#ffcc00'}}>{code}</div>
                </div>}
                <div style={{marginBottom:'20px'}}>
                    <div style={{color:'#888',fontSize:'14px',marginBottom:'10px'}}>Players ({players.length})</div>
                    {players.map((p,i) => <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:'8px',padding:'10px 15px',marginBottom:'8px',fontSize:'18px'}}>{p.username}</div>)}
                </div>
                {isHost && <button style={s.btn} onClick={start}>Start Game</button>}
                {!isHost && <div style={{textAlign:'center',color:'#888'}}>Waiting for host to start...</div>}
            </div>
        </div>
    );

    if (screen === 'starting') return <div style={s.bg}><div style={{fontFamily:'Titan One,sans-serif',fontSize:'60px'}}>Get Ready!</div></div>;

    if (screen === 'question' && question) return (
        <div style={{...s.bg,justifyContent:'flex-start',paddingTop:'40px'}}>
            <div style={{width:'100%',maxWidth:'800px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'20px',fontSize:'18px'}}>
                    <span>Question {question.index+1}/{question.total}</span>
                    <span style={{color:timeLeft<=5?'#e74c3c':'#fff'}}>{timeLeft}s</span>
                </div>
                <div style={{background:'#000040',borderRadius:'16px',padding:'30px',marginBottom:'20px',fontSize:'24px',fontWeight:'700',textAlign:'center',minHeight:'80px',display:'flex',alignItems:'center',justifyContent:'center'}}>{question.question}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px'}}>
                    {question.answers.map((a,i) => (
                        <button key={i} onClick={() => answer(i)} style={{background:selected===null?colors[i]:selected===i?(result&&result.correct?'#2ecc71':'#e74c3c'):colors[i],border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'20px',fontWeight:'700',padding:'20px',cursor:selected===null?'pointer':'default',opacity:selected!==null&&selected!==i?0.5:1,transition:'all 0.2s'}}>{a}</button>
                    ))}
                </div>
                {result && <div style={{textAlign:'center',marginTop:'20px',fontSize:'24px',fontWeight:'700',color:result.correct?'#2ecc71':'#e74c3c'}}>{result.correct?'+'+result.points+' points!':'Wrong!'}</div>}
            </div>
        </div>
    );

    if (screen === 'between') return (
        <div style={s.bg}>
            <div style={{fontFamily:'Titan One,sans-serif',fontSize:'40px',marginBottom:'20px'}}>Scoreboard</div>
            <div style={s.card}>
                {[...players].sort((a,b)=>b.score-a.score).map((p,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.1)',fontSize:'18px'}}>
                        <span style={{color:i===0?'#ffcc00':i===1?'#aaa':i===2?'#cd7f32':'#fff'}}>#{i+1} {p.username}</span>
                        <span style={{color:'#ffcc00'}}>{p.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    if (screen === 'gameover') return (
        <div style={s.bg}>
            <div style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',marginBottom:'10px'}}>Game Over!</div>
            <div style={s.card}>
                {scores.map((p,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'15px',borderBottom:'1px solid rgba(255,255,255,0.1)',fontSize:'20px'}}>
                        <span style={{color:i===0?'#ffcc00':i===1?'#aaa':i===2?'#cd7f32':'#fff'}}>{i===0?'1st':i===1?'2nd':i===2?'3rd':i+1+'th'} {p.username}</span>
                        <span style={{color:'#ffcc00'}}>{p.score} pts</span>
                    </div>
                ))}
                <button style={{...s.btn,marginTop:'20px'}} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    return null;
}
