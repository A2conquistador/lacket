import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const ANS_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const ANS_ICONS = ['▲','◆','●','■'];
const EVENTS = [
  { emoji:'🦊', text:'Fox stole 30 gold!', effect: g => Math.max(0, g-30) },
  { emoji:'💎', text:'Found a gem! +75 gold!', effect: g => g+75 },
  { emoji:'✨', text:'Magic chest! Double gold!', effect: g => g*2 },
  { emoji:'💨', text:'Empty chest...', effect: g => g },
  { emoji:'🍀', text:'Lucky clover! +50 gold!', effect: g => g+50 },
];
const CHEST_POSITIONS = [
  {x:8,y:20},{x:25,y:55},{x:42,y:25},{x:58,y:60},{x:72,y:30},{x:85,y:55},
  {x:15,y:70},{x:50,y:75},{x:78,y:15},{x:35,y:42},
];

export default function GoldQuest() {
  const navigate = useNavigate();
  const { questions, loading, error } = useGameQuestions();
  const [phase, setPhase] = useState('lobby');
  const [gold, setGold] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState(null);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [openedChests, setOpenedChests] = useState([]);
  const [activeChest, setActiveChest] = useState(0);
  const [coinAnims, setCoinAnims] = useState([]);
  const [event, setEvent] = useState(null);
  const [blookPos, setBlookPos] = useState({x:45,y:45});
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const coinId = useRef(0);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = () => {
    setTimeLeft(15);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t<=1){clearInterval(timerRef.current);onTimeout();return 0;} return t-1; });
    },1000);
  };

  const spawnCoins = (count, positive) => {
    const chest = CHEST_POSITIONS[activeChest % CHEST_POSITIONS.length];
    const newCoins = Array(count).fill(null).map((_,i) => ({
      id: coinId.current++,
      x: chest.x + (Math.random()-0.5)*10,
      y: chest.y,
      positive,
    }));
    setCoinAnims(c => [...c, ...newCoins]);
    setTimeout(() => setCoinAnims(c => c.filter(x => !newCoins.find(n=>n.id===x.id))), 1200);
  };

  const onTimeout = () => {
    setCorrectIdx(questions[currentQ]?.correct);
    setSelected(-1);
    setStreak(0);
    setTimeout(() => nextQ(), 1800);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const q = questions[currentQ];
    setSelected(idx);
    setCorrectIdx(q.correct);
    setOpenedChests(c => [...c, activeChest]);

    if (idx === q.correct) {
      const earned = Math.max(10, Math.floor(timeLeft/15*30)) + (streak>=2?10:0);
      const newStreak = streak+1;
      setStreak(newStreak);
      if (newStreak % 4 === 0) {
        const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
        setEvent(ev);
        setGold(g => ev.effect(g+earned));
        spawnCoins(5, true);
        setTimeout(() => setEvent(null), 2000);
      } else {
        setGold(g => g + earned);
        spawnCoins(3, true);
      }
    } else {
      setStreak(0);
      setGold(g => Math.max(0, g-5));
      spawnCoins(1, false);
    }
    setTimeout(() => nextQ(), event ? 2200 : 1500);
  };

  const nextQ = () => {
    setSelected(null);
    setCorrectIdx(null);
    setActiveChest(a => a+1);
    const next = currentQ+1;
    if (next >= questions.length) { setPhase('gameover'); sounds.gameOver();; return; }
    setCurrentQ(next);
    // Animate blook moving to next chest
    const nextChest = CHEST_POSITIONS[(activeChest+1) % CHEST_POSITIONS.length];
    setBlookPos({x: nextChest.x-3, y: nextChest.y-8});
    startTimer();
  };

  const startGame = () => { sounds.click();
    setPhase('question');
    setGold(0);
    setCurrentQ(0);
    setStreak(0);
    setOpenedChests([]);
    setActiveChest(0);
    setBlookPos({x: CHEST_POSITIONS[0].x-3, y: CHEST_POSITIONS[0].y-8});
    startTimer();
  };

  if (loading) return <Loader />;
  if (error || !questions.length) return <NoQ navigate={navigate} />;

  if (phase === 'lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0e00,#2d1a00)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>
      <button onClick={() => navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',color:'#fbbf24',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
      {/* Preview cave */}
      <div style={{width:'360px',height:'200px',background:'linear-gradient(180deg,#1a1200,#2a1e00)',borderRadius:'16px',border:'3px solid #7a5a00',marginBottom:'28px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 40%,rgba(245,158,11,0.15) 0%,transparent 60%)'}} />
        {CHEST_POSITIONS.slice(0,6).map((p,i) => (
          <div key={i} style={{position:'absolute',left:p.x+'%',top:p.y+'%',fontSize:i===0?'28px':'20px',filter:i===0?'drop-shadow(0 0 8px gold)':'none'}}>🪙</div>
        ))}
        <div style={{position:'absolute',left:'30%',top:'40%',fontSize:'24px',animation:'bounce 1s infinite'}}>⭐</div>
        <div style={{position:'absolute',bottom:'8px',left:'50%',transform:'translateX(-50%)',fontSize:'11px',color:'rgba(245,158,11,0.7)',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase'}}>The Gold Cave</div>
      </div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',color:'#f59e0b',margin:'0 0 8px',textShadow:'0 2px 20px rgba(245,158,11,0.5)'}}>Gold Quest</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'12px',fontSize:'15px'}}>{questions.length} chests to open!</p>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap',justifyContent:'center'}}>
        {['✅ Correct → open chest','⚡ Speed → more gold','🔥 Streak → random events'].map(t => (
          <div key={t} style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'99px',padding:'5px 12px',fontSize:'12px',color:'#fbbf24',fontWeight:'600'}}>{t}</div>
        ))}
      </div>
      <button onClick={startGame} style={{padding:'16px 52px',background:'linear-gradient(135deg,#d97706,#b45309)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(217,119,6,0.5)'}}>🏆 Start Quest</button>
    </div>
  );

  if (phase === 'gameover') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0e00,#2d1a00)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'72px'}}>💰</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#f59e0b',margin:0}}>Quest Complete!</h1>
      <div style={{background:'rgba(245,158,11,0.1)',border:'2px solid rgba(245,158,11,0.3)',borderRadius:'20px',padding:'24px 48px',textAlign:'center'}}>
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'2px'}}>Gold Collected</div>
        <div style={{fontFamily:'Titan One,sans-serif',fontSize:'64px',color:'#f59e0b'}}>💰 {gold}</div>
      </div>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#d97706,#b45309)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Play Again</button>
        <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  const chestPos = CHEST_POSITIONS[activeChest % CHEST_POSITIONS.length];

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0e00,#2d1a00)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes coinFly{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-70px) scale(0.5) rotate(360deg);opacity:0}}
        @keyframes chestOpen{0%{transform:scale(1)}30%{transform:scale(1.3) rotate(-5deg)}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1)}}
        @keyframes blookWalk{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes eventPop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes mapGlow{0%,100%{box-shadow:0 0 30px rgba(245,158,11,0.2)}50%{box-shadow:0 0 60px rgba(245,158,11,0.4)}}
      `}</style>

      {/* HUD */}
      <div style={{background:'rgba(0,0,0,0.6)',borderBottom:'2px solid rgba(245,158,11,0.3)',padding:'10px 20px',display:'flex',gap:'16px',alignItems:'center'}}>
        <div style={{fontFamily:'Titan One,sans-serif',fontSize:'20px',color:'#f59e0b'}}>💰 {gold}</div>
        {streak>=2 && <div style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',padding:'3px 10px',fontSize:'13px',color:'#f59e0b',fontWeight:'800'}}>🔥 {streak}x</div>}
        <div style={{flex:1}} />
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>Chest {currentQ+1}/{questions.length}</div>
        <div style={{background:timeLeft<=5?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.1)',border:`1px solid ${timeLeft<=5?'#ef4444':'rgba(245,158,11,0.3)'}`,borderRadius:'8px',padding:'4px 12px',fontWeight:'800',color:timeLeft<=5?'#ef4444':'#fbbf24',fontSize:'15px'}}>{timeLeft}s</div>
      </div>

      {/* CAVE MAP */}
      <div style={{flex:'0 0 auto',height:'calc(100vh - 248px)',minHeight:'260px',position:'relative',overflow:'hidden',background:'radial-gradient(ellipse at 50% 80%,#2a1800 0%,#0d0800 100%)'}}>
        {/* Stalactites */}
        {[10,22,35,48,60,73,85].map((x,i) => (
          <div key={i} style={{position:'absolute',top:0,left:x+'%',width:'0',height:'0',borderLeft:'8px solid transparent',borderRight:'8px solid transparent',borderTop:`${20+i*5}px solid #1a0e00`}} />
        ))}
        {/* Ground layer */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'20%',background:'linear-gradient(180deg,#2a1800,#1a0e00)',borderTop:'2px solid #3a2200'}} />
        {/* Torches */}
        {[15,50,82].map((x,i) => (
          <div key={i} style={{position:'absolute',top:'28%',left:x+'%',fontSize:'20px',filter:'drop-shadow(0 0 8px orange)'}}>🔦</div>
        ))}
        {/* ALL CHESTS */}
        {CHEST_POSITIONS.slice(0, Math.min(questions.length, CHEST_POSITIONS.length)).map((pos, i) => {
          const isActive = i === activeChest % CHEST_POSITIONS.length;
          const isOpened = openedChests.includes(i);
          return (
            <div key={i} style={{position:'absolute',left:pos.x+'%',top:pos.y+'%',fontSize:isActive?'36px':'24px',filter:isActive?'drop-shadow(0 0 12px gold)':'none',opacity:isOpened?0.4:1,animation:isActive&&selected!==null?'chestOpen 0.5s':'none',transition:'all 0.3s',zIndex:isActive?2:1}}>
              {isOpened?(selected===correctIdx?'📂':'🗑️'):'📦'}
              {isActive && <div style={{position:'absolute',top:'-20px',left:'50%',transform:'translateX(-50%)',fontSize:'10px',color:'#fbbf24',fontWeight:'800',whiteSpace:'nowrap',textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>▼ HERE</div>}
            </div>
          );
        })}
        {/* BLOOK (player character) */}
        <div style={{position:'absolute',left:blookPos.x+'%',top:blookPos.y+'%',fontSize:'28px',transition:'left 0.6s ease-out, top 0.6s ease-out',animation:'blookWalk 0.5s ease-in-out infinite',zIndex:3}}>⭐</div>
        {/* COIN ANIMATIONS */}
        {coinAnims.map(c => (
          <div key={c.id} style={{position:'absolute',left:c.x+'%',top:c.y+'%',fontSize:'18px',animation:'coinFly 1.1s ease-out forwards',pointerEvents:'none',zIndex:10}}>
            {c.positive ? '🪙' : '💸'}
          </div>
        ))}
        {/* EVENT OVERLAY */}
        {event && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',zIndex:20}}>
            <div style={{background:'linear-gradient(135deg,#2a1800,#1a0e00)',border:'2px solid #f59e0b',borderRadius:'24px',padding:'32px 48px',textAlign:'center',animation:'eventPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)'}}>
              <div style={{fontSize:'64px',marginBottom:'12px'}}>{event.emoji}</div>
              <div style={{fontFamily:'Titan One,sans-serif',fontSize:'24px',color:'#f59e0b'}}>{event.text}</div>
            </div>
          </div>
        )}
      </div>

      {/* QUESTION PANEL */}
      <div style={{background:'#0d0800',borderTop:'3px solid rgba(245,158,11,0.3)',padding:'14px 16px',flex:'0 0 auto'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'12px',padding:'12px 16px',marginBottom:'10px',textAlign:'center',fontSize:'16px',fontWeight:'700',color:'#e0e7ff',lineHeight:'1.3'}}>{q.question}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.answers.map((ans, idx) => {
              let bg = ANS_COLORS[idx]; let opacity = 1; let extra = {};
              if (selected !== null) {
                if (idx === correctIdx) { bg='#16a34a'; extra={boxShadow:'0 0 14px rgba(22,163,74,0.7)'}; }
                else if (idx === selected) bg='#dc2626';
                else opacity = 0.35;
              }
              return <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected!==null} style={{background:bg,border:'none',borderRadius:'10px',padding:'12px 14px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',cursor:selected?'default':'pointer',opacity,transition:'all 0.15s',textAlign:'left',display:'flex',alignItems:'center',gap:'8px',...extra}}><span style={{opacity:0.85}}>{ANS_ICONS[idx]}</span>{ans}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader(){return <div style={{minHeight:'100vh',background:'#1a0e00',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>Loading...</div>;}
function NoQ({navigate}){return <div style={{minHeight:'100vh',background:'#1a0e00',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',margin:'16px 0 8px'}}>No Questions</h2><button onClick={()=>navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#d97706,#b45309)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button></div></div>;}
