import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PACKS = [
    { id: 'Starter Pack', name: 'Starter Pack', emoji: '🎮', color: '#6366f1', price: 50, desc: 'Great for beginners!' },
    { id: 'Animal Pack', name: 'Animal Pack', emoji: '🐻', color: '#22c55e', price: 75, desc: 'Dogs, cats, dragons and more!' },
    { id: 'Ocean Pack', name: 'Ocean Pack', emoji: '🌊', color: '#0ea5e9', price: 75, desc: 'Deep sea creatures!' },
    { id: 'Space Pack', name: 'Space Pack', emoji: '🚀', color: '#6366f1', price: 100, desc: 'Explore the cosmos!' },
    { id: 'Food Pack', name: 'Food Pack', emoji: '🍕', color: '#ef4444', price: 75, desc: 'Delicious collectibles!' },
    { id: 'Medieval Pack', name: 'Medieval Pack', emoji: '⚔️', color: '#6b7280', price: 100, desc: 'Knights, wizards and castles!' },
    { id: 'Horror Pack', name: 'Horror Pack', emoji: '👻', color: '#7c3aed', price: 150, desc: 'Spooky scary blooks!' },
    { id: 'Nature Pack', name: 'Nature Pack', emoji: '🌿', color: '#22c55e', price: 75, desc: 'Flora and natural wonders!' },
    { id: 'Weather Pack', name: 'Weather Pack', emoji: '⛈️', color: '#0ea5e9', price: 100, desc: 'Storm, sun and snow!' },
    { id: 'Mystery Pack', name: 'Mystery Pack', emoji: '🎭', color: '#ec4899', price: 200, desc: 'What could be inside?' },
    { id: 'Legend Pack', name: 'Legend Pack', emoji: '👑', color: '#f59e0b', price: 500, desc: 'Legendary blooks await!' },
];

const RARITY_COLORS = { Common: '#9ca3af', Uncommon: '#22c55e', Rare: '#3b82f6', Epic: '#ec4899', Legendary: '#f59e0b' };
const RARITY_BG = { Common: 'rgba(156,163,175,0.15)', Uncommon: 'rgba(34,197,94,0.15)', Rare: 'rgba(59,130,246,0.15)', Epic: 'rgba(236,72,153,0.15)', Legendary: 'rgba(245,158,11,0.15)' };

const BLOOK_EMOJIS = {
    'Dog':'🐶','Cat':'🐱','Rabbit':'🐰','Fox':'🦊','Bear':'🐻','Panda':'🐼','Tiger':'🐯','Lion':'🦁','Elephant':'🐘','Dragon':'🐉',
    'Rocket':'🚀','Star':'⭐','Moon':'🌙','Alien':'👽','UFO':'🛸','Comet':'☄️','Planet':'🪐','Astronaut':'👨‍🚀','Black Hole':'🌀','Galaxy':'🌌',
    'Pizza':'🍕','Burger':'🍔','Taco':'🌮','Sushi':'🍣','Ramen':'🍜','Donut':'🍩','Ice Cream':'🍦','Cake':'🎂','Cookie':'🍪','Golden Apple':'🍎',
    'Knight':'⚔️','Shield':'🛡️','Bow':'🏹','Castle':'🏰','Crown':'👑','Wizard':'🧙','Dragon Egg':'🥚','Sword':'🗡️','Dark Knight':'🖤','Holy Grail':'✨',
    'Pixel':'🟦','Glitch':'⚡','Byte':'💾','Neon':'🔮','Circuit':'🔌','Bot':'🤖','Hacker':'💻','Virus':'🦠','Matrix':'🧬','God Mode':'👾',
    'Flower':'🌸','Tree':'🌲','Mushroom':'🍄','Rainbow':'🌈','Tornado':'🌪️','Volcano':'🌋','Crystal':'💎','Aurora':'🌠','Tsunami':'🌊','Phoenix':'🔥',
    'Soccer':'⚽','Basketball':'🏀','Tennis':'🎾','Football':'🏈','Baseball':'⚾','Trophy':'🏆','Gold Medal':'🥇','Racing Flag':'🏁','Champion':'🎖️','GOAT':'🐐',
    'Ghost':'👻','Pumpkin':'🎃','Bat':'🦇','Skull':'💀','Spider':'🕷️','Witch':'🧙‍♀️','Vampire':'🧛','Zombie':'🧟','Demon':'😈','Grim Reaper':'☠️',
    'Fish':'🐟','Crab':'🦀','Octopus':'🐙','Dolphin':'🐬','Shark':'🦈','Turtle':'🐢','Whale':'🐳','Seahorse':'🦄','Kraken':'🦑','Leviathan':'🌊',
    'Fairy':'🧚','Unicorn':'🦄','Gnome':'🧝','Mermaid':'🧜','Centaur':'🏇','Griffin':'🦅','Chimera':'🔥','Hydra':'🐍','Titan':'⚡','God':'👁️'
};

export default function Market() {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState(0);
    const [phase, setPhase] = useState('idle');
    const [activePack, setActivePack] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [spinEmojis, setSpinEmojis] = useState([]);
    const [confetti, setConfetti] = useState([]);
    const spinIntervalRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        axios.get('/api/users/me', { headers: { authorization: token } })
            .then(res => setTokens(res.data.tokens))
            .catch(() => navigate('/login'));
    }, []);

    useEffect(() => () => clearInterval(spinIntervalRef.current), []);

    const createConfetti = (rarity) => {
        const colors = {
            'Common': '#9ca3af',
            'Uncommon': '#22c55e',
            'Rare': '#3b82f6',
            'Epic': '#ec4899',
            'Legendary': '#f59e0b'
        };
        const color = colors[rarity] || '#6366f1';
        const pieces = rarity === 'Legendary' ? 80 : rarity === 'Epic' ? 60 : 40;
        
        const newConfetti = Array.from({ length: pieces }).map((_, i) => ({
            id: Math.random(),
            left: 50 + (Math.random() - 0.5) * 30,
            delay: Math.random() * 0.1,
            duration: 2 + Math.random() * 0.5,
            color: Math.random() > 0.7 ? '#fff' : color,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
        }));
        setConfetti(newConfetti);
        setTimeout(() => setConfetti([]), 2500);
    };

    const openPack = async (pack) => {
        if (phase !== 'idle') return;
        if (tokens < pack.price) { setError('Not enough tokens!'); return; }
        setError('');
        setActivePack(pack);
        setResult(null);
        setPhase('spinning');

        const allEmojis = Object.values(BLOOK_EMOJIS);
        let frame = 0;
        setSpinEmojis(Array(7).fill(null).map(() => allEmojis[Math.floor(Math.random() * allEmojis.length)]));
        spinIntervalRef.current = setInterval(() => {
            frame++;
            setSpinEmojis(prev => prev.map((_, i) => frame % 2 === 0 || i !== 3 ? allEmojis[Math.floor(Math.random() * allEmojis.length)] : prev[i]));
        }, 60);

        let data;
        try {
            const res = await axios.post('/api/buy-pack', { pack: pack.id }, { headers: { authorization: token } });
            data = res.data;
            setTokens(data.user.tokens);
        } catch (err) {
            clearInterval(spinIntervalRef.current);
            setError(err?.response?.data?.error || 'Something went wrong');
            setPhase('idle');
            setActivePack(null);
            return;
        }

        setTimeout(() => {
            clearInterval(spinIntervalRef.current);
            setSpinEmojis(prev => prev.map((e, i) => i === 3 ? '?' : e));
            setPhase('suspense');

            setTimeout(() => {
                const emoji = BLOOK_EMOJIS[data.blook] || '❓';
                setSpinEmojis(prev => prev.map((e, i) => i === 3 ? emoji : e));
                setResult({ blook: data.blook, rarity: data.rarity, pack });
                setPhase('reveal');
                createConfetti(data.rarity);
            }, 1200);
        }, 1600);
    };

    const closeOverlay = () => {
        setPhase('idle');
        setActivePack(null);
        setResult(null);
        setConfetti([]);
    };

    const openAgain = () => {
        const pack = activePack;
        closeOverlay();
        setTimeout(() => openPack(pack), 50);
    };

    const rarityColor = result ? RARITY_COLORS[result.rarity] : '#9ca3af';
    const rarityBg = result ? RARITY_BG[result.rarity] : 'transparent';

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',padding:'40px'}}>
            <style>{`
                @keyframes slotSpin { 0%{transform:translateY(0)} 100%{transform:translateY(-100%)} }
                @keyframes popIn { 0%{transform:scale(0.2) rotate(-15deg);opacity:0} 70%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
                @keyframes rarityFlash { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.05)} }
                @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
                @keyframes particle { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes suspensePulse { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 10px rgba(99,102,241,0.5))} 50%{transform:scale(1.1);filter:drop-shadow(0 0 30px rgba(99,102,241,0.8))} }
                @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
                @keyframes glow { 0%,100%{filter:drop-shadow(0 0 20px var(--glow))} 50%{filter:drop-shadow(0 0 60px var(--glow)) drop-shadow(0 0 100px var(--glow))} }
                @keyframes confettiFall { 0%{transform:translateY(-100vh) rotateZ(0deg);opacity:1} 100%{transform:translateY(100vh) rotateZ(var(--rotation));opacity:0} }
                .pack-card:hover { transform:translateY(-4px) scale(1.02); border-color:rgba(99,102,241,0.5) !important; }
                .open-btn:hover:not(:disabled) { transform:scale(1.04); filter:brightness(1.15); }
                .rare-pulse { animation: rarityFlash 0.5s ease-in-out infinite; }
            `}</style>

            {/* Confetti */}
            {confetti.map(c => (
                <div key={c.id} style={{
                    position: 'fixed',
                    left: `${c.left}%`,
                    top: '-20px',
                    width: `${c.size}px`,
                    height: `${c.size}px`,
                    background: c.color,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    animation: `confettiFall ${c.duration}s linear forwards`,
                    '--rotation': `${c.rotation}deg`,
                    animationDelay: `${c.delay}s`,
                    zIndex: 10000,
                    boxShadow: `0 0 ${c.size}px ${c.color}`,
                }} />
            ))}

            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'40px',maxWidth:'1080px',margin:'0 auto 40px'}}>
                <div>
                    <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'36px',margin:'0 0 4px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Market</h1>
                    <p style={{margin:0,color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Open packs to collect blooks</p>
                </div>
                <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                    <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'12px',padding:'10px 20px',fontSize:'18px',fontWeight:'800',color:'#f59e0b'}}>🪙 {tokens.toLocaleString()}</div>
                    <button onClick={() => navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 20px',cursor:'pointer'}}>← Dashboard</button>
                </div>
            </div>

            {error && <div style={{maxWidth:'1080px',margin:'0 auto 20px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'12px 20px',color:'#f87171'}}>{error}</div>}

            {/* Pack grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px',maxWidth:'1080px',margin:'0 auto'}}>
                {PACKS.map(pack => (
                    <div key={pack.id} className="pack-card" style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'20px',padding:'28px',transition:'all 0.25s',cursor:'pointer'}} onClick={() => openPack(pack)}>
                        <div style={{fontSize:'52px',marginBottom:'12px',transition:'transform 0.2s'}}>{pack.emoji}</div>
                        <div style={{fontFamily:'Titan One,sans-serif',fontSize:'20px',color:'#e0e7ff',marginBottom:'6px'}}>{pack.name}</div>
                        <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',marginBottom:'20px',lineHeight:'1.5'}}>{pack.desc}</div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',fontSize:'12px'}}>
                            <div style={{display:'flex',gap:'6px'}}>
                                {['Common','Uncommon','Rare','Epic','Legendary'].map(r => (
                                    <span key={r} style={{color:RARITY_COLORS[r],fontWeight:'700'}}>{r[0]}</span>
                                ))}
                            </div>
                            <div style={{color:'#f59e0b',fontWeight:'800',fontSize:'18px'}}>🪙 {pack.price}</div>
                        </div>
                        <button className="open-btn" disabled={tokens < pack.price || phase !== 'idle'} style={{width:'100%',padding:'12px',background:tokens>=pack.price?`linear-gradient(135deg,${pack.color},${pack.color}99)`:'rgba(255,255,255,0.05)',border:'none',borderRadius:'10px',color:tokens>=pack.price?'#fff':'rgba(255,255,255,0.3)',fontFamily:'Nunito,sans-serif',fontSize:'16px',fontWeight:'700',cursor:tokens>=pack.price&&phase==='idle'?'pointer':'not-allowed',transition:'all 0.2s'}}>
                            {tokens < pack.price ? '🔒 Not enough tokens' : phase !== 'idle' ? 'Opening...' : 'Open Pack'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Overlay */}
            {phase !== 'idle' && (
                <div style={{position:'fixed',inset:0,background:'rgba(2,4,20,0.98)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,backdropFilter:'blur(4px)'}} onClick={phase === 'reveal' ? closeOverlay : undefined}>
                    <div style={{textAlign:'center',maxWidth:'520px',width:'90%',padding:'20px'}} onClick={e => e.stopPropagation()}>

                        {/* Slot machine row */}
                        {(phase === 'spinning' || phase === 'suspense') && (
                            <div>
                                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',color:'rgba(255,255,255,0.6)',marginBottom:'40px',letterSpacing:'3px',fontWeight:'900'}}>
                                    {phase === 'suspense' ? '✨ ✨ ✨' : 'OPENING...'}
                                </div>
                                <div style={{display:'flex',gap:'12px',justifyContent:'center',alignItems:'center',marginBottom:'40px'}}>
                                    {spinEmojis.map((emoji, i) => (
                                        <div key={i} style={{
                                            width: i === 3 ? '120px' : '70px',
                                            height: i === 3 ? '120px' : '70px',
                                            background: i === 3 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.03)',
                                            border: i === 3 ? '3px solid rgba(99,102,241,0.8)' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: i === 3 ? '64px' : '32px',
                                            animation: phase === 'suspense' && i === 3 ? 'suspensePulse 0.4s ease-in-out infinite' : phase === 'spinning' ? `shake 0.08s ease-in-out infinite` : 'none',
                                            transition: 'all 0.3s',
                                            opacity: Math.abs(i - 3) > 2 ? 0.2 : Math.abs(i - 3) === 2 ? 0.5 : Math.abs(i - 3) === 1 ? 0.75 : 1,
                                            filter: i === 3 && phase === 'suspense' ? 'brightness(1.2)' : 'none',
                                        }}>{emoji}</div>
                                    ))}
                                </div>
                                <div style={{color:'rgba(255,255,255,0.4)',fontSize:'15px',fontWeight:'600'}}>Opening {activePack?.name}...</div>
                            </div>
                        )}

                        {/* Reveal */}
                        {phase === 'reveal' && result && (
                            <div>
                                {/* Particles */}
                                <div style={{position:'relative',display:'inline-block',marginBottom:'24px'}}>
                                    {[...Array(24)].map((_,i) => (
                                        <div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'12px',height:'12px',borderRadius:'50%',background:rarityColor,animation:'particle 1.2s ease-out forwards',pointerEvents:'none','--tx':(Math.cos(i/24*Math.PI*2)*160)+'px','--ty':(Math.sin(i/24*Math.PI*2)*160)+'px',animationDelay:(i*0.03)+'s',zIndex:0,boxShadow:`0 0 8px ${rarityColor}`}} />
                                    ))}
                                    <div className={result.rarity !== 'Common' ? 'rare-pulse' : ''} style={{
                                        width:'180px',height:'180px',borderRadius:'32px',background:rarityBg,
                                        border:`4px solid ${rarityColor}`,display:'flex',alignItems:'center',
                                        justifyContent:'center',fontSize:'100px',position:'relative',zIndex:1,
                                        animation:'popIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards, glow 2s ease-in-out 0.6s infinite',
                                        '--glow': rarityColor,
                                    }}>
                                        {BLOOK_EMOJIS[result.blook] || '❓'}
                                    </div>
                                </div>

                                <div style={{animation:'rarityFlash 0.5s 3',fontSize:'12px',fontWeight:'900',color:rarityColor,textTransform:'uppercase',letterSpacing:'5px',marginTop:'24px',marginBottom:'8px'}}>{result.rarity}</div>
                                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'42px',color:'#e0e7ff',marginBottom:'8px',animation:'popIn 0.4s 0.15s both'}}>{result.blook}</div>
                                <div style={{fontSize:'15px',color:'rgba(255,255,255,0.4)',marginBottom:'40px',animation:'popIn 0.4s 0.2s both'}}>from {result.pack.name}</div>

                                <div style={{display:'flex',gap:'12px',justifyContent:'center',animation:'popIn 0.4s 0.3s both'}}>
                                    <button onClick={openAgain} disabled={tokens < result.pack.price} style={{padding:'14px 36px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'16px',fontWeight:'700',cursor:tokens>=result.pack.price?'pointer':'not-allowed',opacity:tokens>=result.pack.price?1:0.4,transition:'all 0.2s'}}>
                                        🔄 Open Again
                                    </button>
                                    <button onClick={closeOverlay} style={{padding:'14px 36px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'16px',fontWeight:'700',cursor:'pointer',transition:'all 0.2s'}}>
                                        ✓ Done
                                    </button>
                                </div>
                                <div style={{marginTop:'16px',fontSize:'13px',color:'rgba(255,255,255,0.3)',animation:'popIn 0.4s 0.5s both'}}>Click overlay to close</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
