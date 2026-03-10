import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DAYS = [
    { day:1, tokens:25, emoji:'🪙' },
    { day:2, tokens:30, emoji:'💰' },
    { day:3, tokens:40, emoji:'🌟' },
    { day:4, tokens:50, emoji:'💎' },
    { day:5, tokens:65, emoji:'🔥' },
    { day:6, tokens:80, emoji:'⚡' },
    { day:7, tokens:200, emoji:'👑' },
];

export default function DailyReward() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        axios.get('/api/users/claim-status', { headers: { authorization: token } })
            .then(res => setStatus(res.data))
            .catch(() => navigate('/login'));
    }, []);

    const claim = async () => {
        setClaiming(true);
        setError('');
        try {
            const res = await axios.post('/api/users/claim', {}, { headers: { authorization: token } });
            setResult(res.data);
            setStatus(s => ({ ...s, claimed: true, streak: res.data.streak }));
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to claim');
        }
        setClaiming(false);
    };

    const currentDay = status ? ((status.streak % 7) || 7) : 1;
    const nextDay = status ? (((status.claimed ? status.streak : status.streak) % 7) + 1) || 1 : 1;
    const todayTokens = DAYS[Math.min((currentDay - 1), 6)].tokens;

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif'}}>
            <style>{`
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
                @keyframes popIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
                @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.3)}50%{box-shadow:0 0 50px rgba(245,158,11,0.8),0 0 80px rgba(245,158,11,0.3)}}
                @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-120px) rotate(720deg);opacity:0}}
                @keyframes shine{0%{background-position:-200% center}100%{background-position:200% center}}
            `}</style>

            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 32px',borderBottom:'1px solid rgba(99,102,241,0.15)'}}>
                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'24px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',cursor:'pointer'}} onClick={() => navigate('/dashboard')}>Lacket</div>
                <button onClick={() => navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'8px 18px',cursor:'pointer'}}>← Dashboard</button>
            </div>

            <div style={{maxWidth:'680px',margin:'0 auto',padding:'48px 24px'}}>
                {/* Title */}
                <div style={{textAlign:'center',marginBottom:'40px'}}>
                    <div style={{fontSize:'60px',marginBottom:'12px',animation:'float 3s ease-in-out infinite'}}>📅</div>
                    <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'40px',margin:'0 0 8px',background:'linear-gradient(135deg,#f59e0b,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Daily Reward</h1>
                    <p style={{color:'rgba(255,255,255,0.4)',margin:0}}>Come back every day to keep your streak!</p>
                </div>

                {/* Streak badge */}
                {status && (
                    <div style={{display:'flex',justifyContent:'center',marginBottom:'32px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'16px',padding:'14px 28px'}}>
                            <span style={{fontSize:'32px'}}>🔥</span>
                            <div>
                                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'32px',color:'#f59e0b',lineHeight:1}}>{status.streak}</div>
                                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>day streak</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7-day grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'8px',marginBottom:'36px'}}>
                    {DAYS.map((d) => {
                        const isPast = status && d.day < currentDay && status.claimed;
                        const isToday = d.day === currentDay;
                        const isFuture = d.day > currentDay;
                        return (
                            <div key={d.day} style={{
                                background: isToday ? 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(251,191,36,0.08))' : isPast ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                border: `2px solid ${isToday ? '#f59e0b' : isPast ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius:'14px',padding:'10px 4px',textAlign:'center',
                                animation: isToday ? 'glow 2s ease-in-out infinite' : 'none',
                                opacity: isFuture ? 0.45 : 1,
                                transition:'all 0.2s',
                            }}>
                                <div style={{fontSize:'20px',marginBottom:'4px'}}>{isPast ? '✅' : d.emoji}</div>
                                <div style={{fontSize:'9px',fontWeight:'800',color: isToday ? '#f59e0b' : isPast ? '#86efac' : 'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.3px',marginBottom:'3px'}}>{d.day === 7 ? 'BONUS' : `Day ${d.day}`}</div>
                                <div style={{fontSize:'11px',fontWeight:'800',color:'#f59e0b'}}>+{d.tokens}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'12px',padding:'12px 20px',color:'#f87171',marginBottom:'20px',textAlign:'center'}}>{error}</div>
                )}

                {/* Claim result */}
                {result ? (
                    <div style={{textAlign:'center',animation:'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)'}}>
                        <div style={{position:'relative',display:'inline-block',marginBottom:'8px'}}>
                            {[...Array(8)].map((_,i) => (
                                <div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'8px',height:'8px',borderRadius:'50%',background:'#f59e0b',animation:'confetti 1s ease-out forwards',animationDelay:(i*0.08)+'s','--tx':(Math.cos(i/8*Math.PI*2)*70)+'px','--ty':(Math.sin(i/8*Math.PI*2)*70)+'px',transform:`translate(${Math.cos(i/8*Math.PI*2)*70}px,${Math.sin(i/8*Math.PI*2)*70}px)`}} />
                            ))}
                            <div style={{fontSize:'72px',animation:'float 2s ease-in-out infinite'}}>🎉</div>
                        </div>
                        <div style={{fontFamily:'Titan One,sans-serif',fontSize:'36px',color:'#f59e0b',marginBottom:'6px'}}>+{result.tokens_awarded} Tokens!</div>
                        <div style={{color:'rgba(255,255,255,0.4)',marginBottom:'28px'}}>Day {result.streak} streak — see you tomorrow!</div>
                        <button onClick={() => navigate('/dashboard')} style={{padding:'14px 36px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>Back to Dashboard</button>
                    </div>

                ) : status?.claimed ? (
                    <div style={{textAlign:'center',background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.15)',borderRadius:'20px',padding:'32px'}}>
                        <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
                        <div style={{fontFamily:'Titan One,sans-serif',fontSize:'24px',color:'#86efac',marginBottom:'6px'}}>Already claimed today!</div>
                        <div style={{color:'rgba(255,255,255,0.4)',marginBottom:'4px'}}>Come back tomorrow for Day {(status.streak % 7) + 1}</div>
                        <div style={{color:'#f59e0b',fontWeight:'800',fontSize:'16px',marginTop:'10px'}}>Next: +{DAYS[status.streak % 7]?.tokens ?? 25} tokens</div>
                    </div>

                ) : (
                    <div style={{textAlign:'center'}}>
                        <div style={{marginBottom:'20px',color:'rgba(255,255,255,0.5)',fontSize:'15px'}}>
                            Today's reward: <span style={{color:'#f59e0b',fontWeight:'800',fontSize:'20px'}}>+{todayTokens} tokens</span>
                        </div>
                        <button onClick={claim} disabled={claiming} style={{
                            padding:'18px 60px',
                            background:'linear-gradient(135deg,#f59e0b,#d97706)',
                            border:'none',borderRadius:'16px',
                            color:'#000',fontFamily:'Titan One,sans-serif',fontSize:'22px',
                            cursor:claiming?'not-allowed':'pointer',
                            opacity:claiming?0.7:1,
                            animation:'glow 2s ease-in-out infinite',
                            boxShadow:'0 4px 24px rgba(245,158,11,0.35)',
                            transition:'transform 0.1s',
                        }}>
                            {claiming ? '...' : '🎁 Claim Reward'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
