import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const ENEMY_TYPES = [
  { emoji: '👾', hp: 1, speed: 1, reward: 10 },
  { emoji: '🧟', hp: 2, speed: 0.8, reward: 20 },
  { emoji: '👹', hp: 3, speed: 0.6, reward: 30 },
  { emoji: '🐉', hp: 5, speed: 0.4, reward: 50 },
];
const PATH = [0,1,2,3,4,5,6,7,8,9]; // 10 steps along path
const ANS_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const ANS_ICONS = ['▲','◆','●','■'];

export default function TowerDefense() {
  const navigate = useNavigate();
  const { questions, loading, error } = useGameQuestions();
  const [phase, setPhase] = useState('lobby');
  const [towerHP, setTowerHP] = useState(20);
  const [gold, setGold] = useState(50);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState([]);
  const [towers, setTowers] = useState([
    { x: 20, y: 25, type: '🏹', level: 1 },
    { x: 60, y: 70, type: '🗡️', level: 1 },
  ]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [shots, setShots] = useState([]); // {id,x,y} projectile animations
  const [kills, setKills] = useState(0);
  const [showQ, setShowQ] = useState(true);
  const timerRef = useRef(null);
  const enemyMoveRef = useRef(null);
  const shotId = useRef(0);

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(enemyMoveRef.current); }, []);

  const spawnWave = (waveNum) => {
    const count = 2 + waveNum;
    const type = ENEMY_TYPES[Math.min(waveNum - 1, ENEMY_TYPES.length - 1)];
    const newEnemies = Array(count).fill(null).map((_, i) => ({
      id: Date.now() + i,
      ...type,
      maxHp: type.hp,
      progress: -(i * 15), // stagger start
      alive: true,
    }));
    setEnemies(newEnemies);
  };

  const startTimer = () => {
    setTimeLeft(15);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // Enemy movement ticker
  useEffect(() => {
    if (phase !== 'question') return;
    clearInterval(enemyMoveRef.current);
    enemyMoveRef.current = setInterval(() => {
      setEnemies(prev => {
        let damage = 0;
        const updated = prev.map(e => {
          if (!e.alive) return e;
          const newProgress = e.progress + e.speed;
          if (newProgress >= 100) { damage += 1; return { ...e, alive: false, progress: 100 }; }
          return { ...e, progress: newProgress };
        });
        if (damage > 0) {
          setTowerHP(hp => {
            const next = hp - damage;
            if (next <= 0) { clearInterval(enemyMoveRef.current); clearInterval(timerRef.current); setPhase('gameover'); sounds.gameOver();; return 0; }
            return next;
          });
        }
        return updated;
      });
    }, 200);
    return () => clearInterval(enemyMoveRef.current);
  }, [phase]);

  const fireShot = (targetId) => {
    const id = shotId.current++;
    setShots(s => [...s, { id, targetId }]);
    setTimeout(() => setShots(s => s.filter(x => x.id !== id)), 400);
  };

  const onTimeout = () => {
    setCorrectIdx(questions[currentQ]?.correct);
    setSelected(-1);
    // Enemies advance faster on timeout
    setEnemies(prev => prev.map(e => ({ ...e, progress: e.progress + 15 })));
    setTimeout(() => nextQ(), 1800);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const q = questions[currentQ];
    setSelected(idx);
    setCorrectIdx(q.correct);
    if (idx === q.correct) {
      // Kill first alive enemy
      setEnemies(prev => {
        const firstAlive = prev.findIndex(e => e.alive);
        if (firstAlive === -1) return prev;
        fireShot(prev[firstAlive].id);
        const updated = [...prev];
        const e = updated[firstAlive];
        const newHp = e.hp - 1;
        if (newHp <= 0) {
          setGold(g => g + e.reward);
          setKills(k => k + 1);
          updated[firstAlive] = { ...e, hp: 0, alive: false };
        } else {
          updated[firstAlive] = { ...e, hp: newHp };
        }
        return updated;
      });
    } else {
      setTowerHP(hp => Math.max(0, hp - 2));
    }
    setTimeout(() => {
      const allDead = enemies.every(e => !e.alive);
      if (allDead) {
        setWave(w => { spawnWave(w + 1); return w + 1; });
      }
      nextQ();
    }, 1200);
  };

  const nextQ = () => {
    setSelected(null);
    setCorrectIdx(null);
    const next = currentQ + 1;
    if (next >= questions.length) { setPhase('victory'); return; }
    setCurrentQ(next);
    startTimer();
  };

  const startGame = () => { sounds.click();
    setPhase('question');
    setTowerHP(20);
    setGold(50);
    setWave(1);
    setKills(0);
    setCurrentQ(0);
    spawnWave(1);
    startTimer();
  };

  if (loading) return <Loader />;
  if (error || !questions.length) return <NoQ navigate={navigate} />;

  if (phase === 'lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a3a1a 0%,#0d1f0d 100%)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>
      <button onClick={() => navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'10px',color:'#86efac',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
      {/* Fake map preview */}
      <div style={{width:'360px',height:'200px',background:'#2d5a1b',borderRadius:'16px',border:'3px solid #4a8a2a',marginBottom:'28px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
        {/* Path */}
        <div style={{position:'absolute',top:'50%',left:0,right:0,height:'40px',transform:'translateY(-50%)',background:'#8B7355',borderTop:'3px solid #6B5335',borderBottom:'3px solid #6B5335'}} />
        {/* Grass tiles */}
        {[...Array(12)].map((_,i) => <div key={i} style={{position:'absolute',top:i%2===0?'15%':'65%',left:(i*9)+'%',fontSize:'18px',opacity:0.6}}>{['🌲','🌿','🌸'][i%3]}</div>)}
        {/* Tower */}
        <div style={{position:'absolute',top:'8%',left:'30%',fontSize:'28px'}}>🏰</div>
        <div style={{position:'absolute',top:'60%',left:'65%',fontSize:'24px'}}>🗼</div>
        {/* Enemy preview */}
        <div style={{position:'absolute',top:'38%',left:'50%',fontSize:'22px',transform:'translateY(-50%)'}}>👾</div>
        <div style={{position:'absolute',top:'38%',left:'25%',fontSize:'22px',transform:'translateY(-50%)',opacity:0.7}}>🧟</div>
        <div style={{position:'absolute',top:'38%',left:'75%',fontSize:'18px',transform:'translateY(-50%)',opacity:0.5}}>👹</div>
      </div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',color:'#4ade80',margin:'0 0 8px',textShadow:'0 2px 20px rgba(74,222,128,0.4)'}}>Tower Defense</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'12px',fontSize:'15px'}}>{questions.length} questions • Defend your kingdom!</p>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap',justifyContent:'center'}}>
        {['✅ Correct → kill enemy','❌ Wrong → -2 tower HP','⏱️ Timeout → enemies advance'].map(t => (
          <div key={t} style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'99px',padding:'5px 12px',fontSize:'12px',color:'#86efac',fontWeight:'600'}}>{t}</div>
        ))}
      </div>
      <button onClick={startGame} style={{padding:'16px 52px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(22,163,74,0.5)'}}>⚔️ Start Defense</button>
    </div>
  );

  if (phase === 'gameover') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#3a1a1a,#1a0a0a)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'80px'}}>🏚️</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#f87171',margin:0}}>Tower Fallen!</h1>
      <p style={{color:'rgba(255,255,255,0.4)'}}>Survived {wave - 1} waves • {kills} enemies defeated</p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'15px'}}>Try Again</button>
        <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'15px'}}>Back</button>
      </div>
    </div>
  );

  if (phase === 'victory') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a3a1a,#0d1f0d)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'80px'}}>🏆</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#4ade80',margin:0}}>Kingdom Saved!</h1>
      <p style={{color:'rgba(255,255,255,0.4)'}}>Tower HP: {towerHP}/20 • {kills} kills • {gold} gold</p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Play Again</button>
        <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  const hpPct = (towerHP / 20) * 100;

  return (
    <div style={{minHeight:'100vh',background:'#1a3a1a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',userSelect:'none'}}>
      <style>{`
        @keyframes walkRight{0%{transform:scaleX(-1) translateX(0)}100%{transform:scaleX(-1) translateX(-8px)}}
        @keyframes shotFly{0%{transform:scale(1);opacity:1}100%{transform:scale(0.2) translateX(60px);opacity:0}}
        @keyframes enemyDie{0%{transform:scale(1);opacity:1}50%{transform:scale(1.5) rotate(20deg);opacity:0.5}100%{transform:scale(0);opacity:0}}
        @keyframes hpFlash{0%,100%{filter:none}50%{filter:brightness(3) saturate(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>

      {/* MAP AREA */}
      <div style={{flex:'0 0 auto',height:'calc(100vh - 240px)',minHeight:'280px',position:'relative',overflow:'hidden',background:'#2d5a1b'}}>
        {/* Sky/clouds at top */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'30%',background:'linear-gradient(180deg,#1a6b3c,#2d7a28)',display:'flex',alignItems:'center',padding:'0 20px',gap:'30px'}}>
          {[...Array(5)].map((_,i) => <div key={i} style={{fontSize:'28px',opacity:0.5,marginLeft:i*80+'px'}}>☁️</div>)}
        </div>
        {/* Ground / grass rows */}
        <div style={{position:'absolute',top:'30%',left:0,right:0,bottom:0,background:'#3a7a20',display:'grid',gridTemplateColumns:'repeat(20,1fr)',gap:'1px'}}>
          {[...Array(80)].map((_,i) => <div key={i} style={{background:i%7===0?'#4a8a28':'#3a7a20',borderRadius:'1px'}} />)}
        </div>
        {/* PATH - horizontal dirt road */}
        <div style={{position:'absolute',top:'50%',left:0,right:0,height:'18%',transform:'translateY(-50%)',background:'#8B7355',borderTop:'4px solid #6B5335',borderBottom:'4px solid #6B5335',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:'60px',gap:0}}>
          {/* Dashed center line */}
          {[...Array(20)].map((_,i) => <div key={i} style={{width:'30px',height:'3px',background:'#a08060',marginRight:'20px',borderRadius:'2px',opacity:0.5,flexShrink:0}} />)}
        </div>
        {/* TOWERS on grass */}
        {towers.map((t,i) => (
          <div key={i} style={{position:'absolute',top:i===0?'12%':'68%',left:(15+i*40)+'%',fontSize:'36px',filter:'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',animation:'bounce 2s ease-in-out infinite',animationDelay:i*0.5+'s'}}>
            {t.type === '🏹' ? '🏹' : '🗡️'}
          </div>
        ))}
        {/* Castle (defended structure) at right */}
        <div style={{position:'absolute',top:'28%',right:'3%',fontSize:'52px',filter:'drop-shadow(2px 4px 12px rgba(0,0,0,0.6))'}}>🏰</div>
        {/* Tower HP display */}
        <div style={{position:'absolute',top:'20%',right:'2%',width:'60px'}}>
          <div style={{height:'6px',background:'rgba(0,0,0,0.3)',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:hpPct+'%',background:towerHP<=5?'#ef4444':towerHP<=10?'#f59e0b':'#22c55e',transition:'width 0.3s',borderRadius:'3px'}} />
          </div>
          <div style={{fontSize:'10px',color:'#fff',textAlign:'center',marginTop:'2px',fontWeight:'700',textShadow:'0 1px 3px rgba(0,0,0,0.8)'}}>❤️ {towerHP}/20</div>
        </div>
        {/* ENEMIES walking along path */}
        {enemies.map(e => {
          if (!e.alive || e.progress < 0) return null;
          const leftPct = Math.min(85, e.progress * 0.85);
          return (
            <div key={e.id} style={{position:'absolute',top:'42%',left:leftPct+'%',transform:'translateY(-50%)',textAlign:'center',transition:'left 0.2s linear'}}>
              <div style={{fontSize:'28px',animation:e.alive?'walkRight 0.4s ease-in-out infinite':'enemyDie 0.5s forwards',display:'inline-block'}}>{e.emoji}</div>
              {/* Enemy HP bar */}
              <div style={{width:'32px',height:'4px',background:'rgba(0,0,0,0.4)',borderRadius:'2px',marginTop:'2px'}}>
                <div style={{height:'100%',width:(e.hp/e.maxHp*100)+'%',background:'#ef4444',borderRadius:'2px',transition:'width 0.2s'}} />
              </div>
            </div>
          );
        })}
        {/* Shot animations */}
        {shots.map(s => (
          <div key={s.id} style={{position:'absolute',top:'46%',left:'25%',fontSize:'16px',animation:'shotFly 0.4s forwards',pointerEvents:'none'}}>⬡</div>
        ))}
        {/* HUD top-left */}
        <div style={{position:'absolute',top:'8px',left:'12px',display:'flex',gap:'10px'}}>
          <div style={{background:'rgba(0,0,0,0.6)',borderRadius:'10px',padding:'6px 12px',fontSize:'13px',fontWeight:'800',color:'#f59e0b',backdropFilter:'blur(4px)'}}>💰 {gold}</div>
          <div style={{background:'rgba(0,0,0,0.6)',borderRadius:'10px',padding:'6px 12px',fontSize:'13px',fontWeight:'800',color:'#86efac',backdropFilter:'blur(4px)'}}>🌊 Wave {wave}</div>
          <div style={{background:'rgba(0,0,0,0.6)',borderRadius:'10px',padding:'6px 12px',fontSize:'13px',fontWeight:'800',color:'#c4b5fd',backdropFilter:'blur(4px)'}}>⚔️ {kills} kills</div>
        </div>
        {/* Timer circle top right */}
        <div style={{position:'absolute',top:'8px',right:'80px',background:'rgba(0,0,0,0.7)',borderRadius:'50%',width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',border:`3px solid ${timeLeft<=5?'#ef4444':timeLeft<=10?'#f59e0b':'#4ade80'}`,backdropFilter:'blur(4px)'}}>
          <span style={{fontFamily:'Titan One,sans-serif',fontSize:'16px',color:timeLeft<=5?'#ef4444':'#fff'}}>{timeLeft}</span>
        </div>
      </div>

      {/* QUESTION PANEL */}
      <div style={{background:'#0d1f0d',borderTop:'3px solid #2d5a1b',padding:'14px 16px',flex:'0 0 auto'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'12px',padding:'12px 16px',marginBottom:'12px',textAlign:'center',fontSize:'16px',fontWeight:'700',color:'#e0e7ff',lineHeight:'1.3'}}>
            {q.question}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.answers.map((ans, idx) => {
              let bg = ANS_COLORS[idx]; let opacity = 1; let extra = {};
              if (selected !== null) {
                if (idx === correctIdx) { bg = '#16a34a'; extra = {boxShadow:'0 0 14px rgba(22,163,74,0.7)'}; }
                else if (idx === selected) bg = '#dc2626';
                else opacity = 0.35;
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null} style={{background:bg,border:'none',borderRadius:'10px',padding:'12px 16px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',fontWeight:'700',cursor:selected?'default':'pointer',opacity,transition:'all 0.15s',textAlign:'left',display:'flex',alignItems:'center',gap:'10px',...extra}}>
                  <span style={{fontSize:'16px',opacity:0.85}}>{ANS_ICONS[idx]}</span>{ans}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader() { return <div style={{minHeight:'100vh',background:'#1a3a1a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif',fontSize:'18px'}}>Loading...</div>; }
function NoQ({ navigate }) { return <div style={{minHeight:'100vh',background:'#1a3a1a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',margin:'16px 0 8px'}}>No Questions Found</h2><button onClick={()=>navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back to Play</button></div></div>; }
