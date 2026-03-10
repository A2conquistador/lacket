import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const ANS_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const ANS_ICONS = ['▲','◆','●','■'];
const PRODUCTS = ['📦','🔩','⚙️','🔋','💡','🔧','🛠️','📱'];
const UPGRADES = [
  {name:'Speed Belt',cost:30,desc:'+5 items/correct',icon:'⚡',owned:false},
  {name:'Auto Clamp',cost:50,desc:'No penalty on wrong',icon:'🦾',owned:false},
  {name:'Turbo Press',cost:80,desc:'3× items produced',icon:'🏭',owned:false},
];

export default function Factory() {
  const navigate = useNavigate();
  const { questions, loading, error } = useGameQuestions();
  const [phase, setPhase] = useState('lobby');
  const [items, setItems] = useState(0);
  const [money, setMoney] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [beltItems, setBeltItems] = useState([]); // items on conveyor
  const [upgrades, setUpgrades] = useState([false,false,false]);
  const [streak, setStreak] = useState(0);
  const [machineAnim, setMachineAnim] = useState(false);
  const timerRef = useRef(null);
  const beltId = useRef(0);
  const beltRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Move belt items
  useEffect(() => {
    if (phase !== 'question') return;
    const iv = setInterval(() => {
      setBeltItems(prev => prev.map(i => ({...i, x: i.x + 1.2})).filter(i => i.x < 115));
    }, 60);
    return () => clearInterval(iv);
  }, [phase]);

  const addBeltItem = (count) => {
    const emoji = PRODUCTS[Math.floor(Math.random()*PRODUCTS.length)];
    const newItems = Array(count).fill(null).map((_,i) => ({
      id: beltId.current++, emoji, x: -5 + i*8, y: 0
    }));
    setBeltItems(b => [...b, ...newItems]);
    setMachineAnim(true);
    setTimeout(() => setMachineAnim(false), 400);
  };

  const startTimer = () => {
    setTimeLeft(15);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);onTimeout();return 0;} return t-1; });
    },1000);
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
    if (idx === q.correct) {
      const count = upgrades[2] ? 3 : upgrades[0] ? 2 : 1;
      const earned = count * 10;
      setItems(i => i+count);
      setMoney(m => m+earned);
      setStreak(s => s+1);
      addBeltItem(count);
    } else {
      if (!upgrades[1]) { setMoney(m => Math.max(0,m-5)); }
      setStreak(0);
    }
    setTimeout(() => nextQ(), 1300);
  };

  const nextQ = () => {
    setSelected(null);
    setCorrectIdx(null);
    const next = currentQ+1;
    if (next >= questions.length) { setPhase('gameover'); sounds.gameOver();; return; }
    setCurrentQ(next);
    startTimer();
  };

  const buyUpgrade = (i) => {
    if (money < UPGRADES[i].cost || upgrades[i]) return;
    setMoney(m => m - UPGRADES[i].cost);
    setUpgrades(u => { const n=[...u]; n[i]=true; return n; });
  };

  const startGame = () => { sounds.click();
    setPhase('question');
    setItems(0); setMoney(0);
    setCurrentQ(0); setStreak(0);
    setUpgrades([false,false,false]);
    setBeltItems([]);
    startTimer();
  };

  if (loading) return <Loader />;
  if (error || !questions.length) return <NoQ navigate={navigate} />;

  if (phase === 'lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0a1a0a,#1a2a0a)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>
      <button onClick={() => navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'10px',color:'#86efac',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
      {/* Factory preview */}
      <div style={{width:'360px',height:'200px',background:'linear-gradient(180deg,#1a2a1a,#0a1a0a)',borderRadius:'16px',border:'3px solid #2a4a1a',marginBottom:'28px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
        {/* Machines */}
        <div style={{position:'absolute',top:'15%',left:'10%',fontSize:'36px',filter:'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))'}}>🏭</div>
        <div style={{position:'absolute',top:'15%',right:'10%',fontSize:'32px'}}>⚙️</div>
        {/* Belt */}
        <div style={{position:'absolute',top:'55%',left:0,right:0,height:'20%',background:'#333',borderTop:'3px solid #555',borderBottom:'3px solid #555',display:'flex',alignItems:'center',overflow:'hidden',gap:'20px',padding:'0 10px'}}>
          {['📦','⚙️','🔩','📦','💡'].map((e,i) => <span key={i} style={{fontSize:'18px',opacity:0.8}}>{e}</span>)}
        </div>
        {/* Smoke */}
        <div style={{position:'absolute',top:'5%',left:'18%',fontSize:'18px',opacity:0.5}}>💨</div>
        <div style={{position:'absolute',bottom:'5px',left:'50%',transform:'translateX(-50%)',fontSize:'11px',color:'rgba(34,197,94,0.7)',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase'}}>BlookFactory™</div>
      </div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',color:'#4ade80',margin:'0 0 8px',textShadow:'0 2px 20px rgba(74,222,128,0.4)'}}>Factory</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'12px',fontSize:'15px'}}>{questions.length} questions • Build your empire!</p>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap',justifyContent:'center'}}>
        {['✅ Correct → produce items','💰 Items → money','🔧 Buy upgrades mid-game'].map(t => (
          <div key={t} style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'99px',padding:'5px 12px',fontSize:'12px',color:'#86efac',fontWeight:'600'}}>{t}</div>
        ))}
      </div>
      <button onClick={startGame} style={{padding:'16px 52px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(22,163,74,0.4)'}}>🏭 Start Factory</button>
    </div>
  );

  if (phase === 'gameover') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0a1a0a,#1a2a0a)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'72px'}}>🏭</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#4ade80',margin:0}}>Factory Report</h1>
      <div style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'20px',padding:'28px 48px',textAlign:'center',display:'flex',gap:'40px'}}>
        <div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',textTransform:'uppercase'}}>Items</div><div style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#4ade80'}}>📦{items}</div></div>
        <div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',textTransform:'uppercase'}}>Revenue</div><div style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#f59e0b'}}>💰{money}</div></div>
      </div>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Play Again</button>
        <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  const q = questions[currentQ];

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#111811,#0a1a0a)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes machineShake{0%,100%{transform:translateY(0)}25%{transform:translateY(-4px)}75%{transform:translateY(4px)}}
        @keyframes smoke{0%{transform:translateY(0);opacity:0.6}100%{transform:translateY(-30px);opacity:0}}
        @keyframes gearSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* HUD */}
      <div style={{background:'rgba(0,0,0,0.7)',borderBottom:'2px solid rgba(34,197,94,0.3)',padding:'10px 20px',display:'flex',gap:'16px',alignItems:'center'}}>
        <div style={{fontWeight:'800',color:'#4ade80',fontSize:'15px'}}>📦 {items} items</div>
        <div style={{fontWeight:'800',color:'#f59e0b',fontSize:'15px'}}>💰 ${money}</div>
        {streak>=2 && <div style={{background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'8px',padding:'3px 10px',fontSize:'12px',color:'#4ade80',fontWeight:'800'}}>🔥 {streak}x</div>}
        <div style={{flex:1}}/>
        <div style={{background:timeLeft<=5?'rgba(239,68,68,0.2)':'rgba(34,197,94,0.1)',border:`1px solid ${timeLeft<=5?'#ef4444':'rgba(34,197,94,0.3)'}`,borderRadius:'8px',padding:'4px 12px',fontWeight:'800',color:timeLeft<=5?'#ef4444':'#4ade80',fontSize:'15px'}}>{timeLeft}s</div>
      </div>

      {/* FACTORY FLOOR */}
      <div style={{flex:'0 0 auto',height:'calc(100vh - 240px)',minHeight:'260px',position:'relative',overflow:'hidden',background:'linear-gradient(180deg,#1a2a1a,#0d1a0d)'}}>
        {/* Background grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(34,197,94,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

        {/* Ceiling pipes */}
        <div style={{position:'absolute',top:'8%',left:0,right:0,height:'8px',background:'#2a3a2a',borderBottom:'2px solid #3a5a3a'}} />
        {[20,45,70].map((x,i) => <div key={i} style={{position:'absolute',top:'8%',left:x+'%',width:'6px',height:'40px',background:'#3a5a3a'}} />)}

        {/* MACHINES */}
        {[{x:8,emoji:'🏭',size:52},{x:55,emoji:'⚙️',size:44},{x:82,emoji:'🔨',size:40}].map((m,i) => (
          <div key={i} style={{position:'absolute',top:'18%',left:m.x+'%'}}>
            <div style={{fontSize:m.size+'px',animation:machineAnim&&i===0?'machineShake 0.4s':'none',filter:'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))'}}>{m.emoji}</div>
            {machineAnim && i===0 && <div style={{position:'absolute',top:'-20px',left:'10px',fontSize:'14px',animation:'smoke 0.8s ease-out forwards'}}>💨</div>}
          </div>
        ))}

        {/* Spinning gears */}
        <div style={{position:'absolute',top:'15%',left:'40%',fontSize:'28px',animation:'gearSpin 3s linear infinite',opacity:0.3}}>⚙️</div>
        <div style={{position:'absolute',top:'22%',left:'72%',fontSize:'20px',animation:'gearSpin 2s linear infinite reverse',opacity:0.3}}>⚙️</div>

        {/* CONVEYOR BELT */}
        <div style={{position:'absolute',top:'58%',left:0,right:0,height:'60px'}}>
          {/* Belt structure */}
          <div style={{position:'absolute',top:'20px',left:0,right:0,height:'22px',background:'#2a2a2a',borderTop:'3px solid #444',borderBottom:'3px solid #444',overflow:'hidden'}}>
            {/* Belt lines */}
            <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(90deg,transparent 0px,transparent 38px,rgba(255,255,255,0.08) 38px,rgba(255,255,255,0.08) 40px)',animation:'beltMove 0.8s linear infinite'}} />
          </div>
          {/* Belt rollers */}
          {[0,10,20,30,40,50,60,70,80,90,100].map((x,i) => <div key={i} style={{position:'absolute',top:'18px',left:x+'%',width:'6px',height:'26px',background:'#555',borderRadius:'3px'}} />)}
          {/* ITEMS ON BELT */}
          {beltItems.map(item => (
            <div key={item.id} style={{position:'absolute',top:'5px',left:item.x+'%',fontSize:'22px',pointerEvents:'none',transition:'left 0.06s linear'}}>{item.emoji}</div>
          ))}
        </div>

        {/* Worker blook */}
        <div style={{position:'absolute',top:'42%',left:'28%',fontSize:'32px',transform:'scaleX(-1)',filter:'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))'}}>⭐</div>

        {/* UPGRADES PANEL */}
        <div style={{position:'absolute',top:'8px',right:'8px',display:'flex',flexDirection:'column',gap:'6px'}}>
          {UPGRADES.map((u,i) => (
            <div key={i} onClick={() => buyUpgrade(i)} style={{background:upgrades[i]?'rgba(34,197,94,0.2)':'rgba(0,0,0,0.6)',border:`1px solid ${upgrades[i]?'rgba(34,197,94,0.5)':money>=u.cost?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.1)'}`,borderRadius:'10px',padding:'6px 10px',cursor:upgrades[i]||money<u.cost?'default':'pointer',opacity:upgrades[i]||money>=u.cost?1:0.5,transition:'all 0.2s',minWidth:'120px'}}>
              <div style={{fontSize:'12px',fontWeight:'700',color:'#e0e7ff',display:'flex',gap:'6px',alignItems:'center'}}><span>{u.icon}</span>{u.name}</div>
              {upgrades[i]
                ? <div style={{fontSize:'10px',color:'#4ade80',fontWeight:'700'}}>✅ Active</div>
                : <div style={{fontSize:'10px',color:'#f59e0b',fontWeight:'700'}}>💰 ${u.cost}</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION PANEL */}
      <div style={{background:'#0a1a0a',borderTop:'3px solid rgba(34,197,94,0.3)',padding:'14px 16px',flex:'0 0 auto'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'12px',padding:'12px 16px',marginBottom:'10px',textAlign:'center',fontSize:'16px',fontWeight:'700',color:'#e0e7ff',lineHeight:'1.3'}}>{q.question}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            {q.answers.map((ans,idx) => {
              let bg=ANS_COLORS[idx]; let opacity=1; let extra={};
              if(selected!==null){
                if(idx===correctIdx){bg='#16a34a';extra={boxShadow:'0 0 14px rgba(22,163,74,0.7)'};}
                else if(idx===selected)bg='#dc2626';
                else opacity=0.35;
              }
              return <button key={idx} onClick={()=>handleAnswer(idx)} disabled={selected!==null} style={{background:bg,border:'none',borderRadius:'10px',padding:'12px 14px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',cursor:selected?'default':'pointer',opacity,transition:'all 0.15s',textAlign:'left',display:'flex',alignItems:'center',gap:'8px',...extra}}><span style={{opacity:0.85}}>{ANS_ICONS[idx]}</span>{ans}</button>;
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes beltMove{from{background-position:0 0}to{background-position:-40px 0}}`}</style>
    </div>
  );
}

function Loader(){return <div style={{minHeight:'100vh',background:'#0a1a0a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>Loading...</div>;}
function NoQ({navigate}){return <div style={{minHeight:'100vh',background:'#0a1a0a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',margin:'16px 0 8px'}}>No Questions</h2><button onClick={()=>navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button></div></div>;}
