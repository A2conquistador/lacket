import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const ANS_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const ANS_ICONS = ['▲','◆','●','■'];
const CUSTOMERS = [
  {name:'Alice',emoji:'👩',blook:'🐱',order:'☕ Latte'},
  {name:'Bob',emoji:'🧔',blook:'🐶',order:'🍰 Cake'},
  {name:'Carol',emoji:'👱‍♀️',blook:'🦊',order:'🧁 Muffin'},
  {name:'Dave',emoji:'🧑',blook:'🐸',order:'🍵 Tea'},
  {name:'Eve',emoji:'👩‍🦰',blook:'🐼',order:'🥐 Croissant'},
  {name:'Frank',emoji:'👨‍🦳',blook:'🐯',order:'🍩 Donut'},
  {name:'Grace',emoji:'👩‍🦱',blook:'🦁',order:'🧋 Boba'},
];
const TABLE_POSITIONS = [{x:8,y:28},{x:32,y:18},{x:56,y:28},{x:78,y:18},{x:18,y:52},{x:46,y:58},{x:70,y:50}];

export default function Cafe() {
  const navigate = useNavigate();
  const { questions, loading, error } = useGameQuestions();
  const [phase, setPhase] = useState('lobby');
  const [tips, setTips] = useState(0);
  const [served, setServed] = useState(0);
  const [missed, setMissed] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [customer, setCustomer] = useState(CUSTOMERS[0]);
  const [tableIdx, setTableIdx] = useState(0);
  const [tipAnim, setTipAnim] = useState(null);
  const [servedTables, setServedTables] = useState([]);
  const [streak, setStreak] = useState(0);
  const [waiterPos, setWaiterPos] = useState({x:45,y:75});
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

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
    setMissed(m => m+1);
    setStreak(0);
    setTipAnim({text:'😤 Left without ordering!', color:'#ef4444'});
    setTimeout(() => { setTipAnim(null); nextQ(); }, 1800);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const q = questions[currentQ];
    setSelected(idx);
    setCorrectIdx(q.correct);
    if (idx === q.correct) {
      const tip = Math.max(5, Math.floor(timeLeft/15*20)) + (streak>=2?5:0);
      setTips(t => t+tip);
      setServed(s => s+1);
      setStreak(s => s+1);
      setServedTables(st => [...st, tableIdx]);
      setTipAnim({text:`+$${tip} tip! ${streak>=3?'⭐⭐':''}`, color:'#f59e0b'});
      // Animate waiter to table
      const tbl = TABLE_POSITIONS[tableIdx % TABLE_POSITIONS.length];
      setWaiterPos({x:tbl.x+3, y:tbl.y+10});
    } else {
      setMissed(m => m+1);
      setStreak(0);
      setTipAnim({text:'❌ Wrong order! No tip', color:'#ef4444'});
    }
    setTimeout(() => { setTipAnim(null); nextQ(); }, 1600);
  };

  const nextQ = () => {
    setSelected(null);
    setCorrectIdx(null);
    const next = currentQ+1;
    if (next >= questions.length) { setPhase('gameover'); sounds.gameOver();; return; }
    setCurrentQ(next);
    const nextTable = (tableIdx+1) % TABLE_POSITIONS.length;
    setTableIdx(nextTable);
    setCustomer(CUSTOMERS[next % CUSTOMERS.length]);
    setWaiterPos({x:45,y:75});
    startTimer();
  };

  const startGame = () => { sounds.click();
    setPhase('question');
    setTips(0); setServed(0); setMissed(0);
    setCurrentQ(0); setStreak(0);
    setServedTables([]);
    setTableIdx(0);
    setCustomer(CUSTOMERS[0]);
    setWaiterPos({x:45,y:75});
    startTimer();
  };

  if (loading) return <Loader />;
  if (error || !questions.length) return <NoQ navigate={navigate} />;

  if (phase === 'lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0a20,#0d0518)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>
      <button onClick={() => navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'10px',color:'#c4b5fd',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
      {/* Cafe preview */}
      <div style={{width:'360px',height:'200px',background:'linear-gradient(180deg,#2a1a35,#1a0e25)',borderRadius:'16px',border:'3px solid #4a2a6a',marginBottom:'28px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
        {/* Tables */}
        {TABLE_POSITIONS.slice(0,5).map((t,i) => (
          <div key={i} style={{position:'absolute',left:t.x+'%',top:t.y+'%'}}>
            <div style={{fontSize:'20px'}}>🪑</div>
            <div style={{position:'absolute',top:'-16px',left:'2px',fontSize:'14px'}}>{CUSTOMERS[i].blook}</div>
          </div>
        ))}
        {/* Counter */}
        <div style={{position:'absolute',bottom:'8px',left:0,right:0,height:'24px',background:'#3a2a4a',borderTop:'2px solid #5a3a7a',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <span style={{fontSize:'16px'}}>☕</span><span style={{fontSize:'16px'}}>🍰</span><span style={{fontSize:'16px'}}>🧁</span>
        </div>
        <div style={{position:'absolute',bottom:'32px',left:'50%',transform:'translateX(-50%)',fontSize:'11px',color:'rgba(167,139,250,0.8)',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase'}}>Blook Café</div>
      </div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',color:'#a78bfa',margin:'0 0 8px',textShadow:'0 2px 20px rgba(167,139,250,0.5)'}}>Café</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'12px',fontSize:'15px'}}>{questions.length} customers waiting!</p>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap',justifyContent:'center'}}>
        {['✅ Correct → serve customer','⚡ Fast → bigger tips','🌟 Streak → bonus tips'].map(t => (
          <div key={t} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'99px',padding:'5px 12px',fontSize:'12px',color:'#c4b5fd',fontWeight:'600'}}>{t}</div>
        ))}
      </div>
      <button onClick={startGame} style={{padding:'16px 52px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(124,58,237,0.5)'}}>☕ Open Café</button>
    </div>
  );

  if (phase === 'gameover') {
    const rating = served > missed*2 ? 5 : served > missed ? 3 : 1;
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0a20,#0d0518)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
        <div style={{fontSize:'72px'}}>☕</div>
        <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#a78bfa',margin:0}}>Café Closed!</h1>
        <div style={{fontSize:'28px'}}>{'⭐'.repeat(rating)}</div>
        <div style={{background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'20px',padding:'24px 48px',display:'flex',gap:'32px',textAlign:'center'}}>
          <div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',textTransform:'uppercase'}}>Tips</div><div style={{fontFamily:'Titan One,sans-serif',fontSize:'40px',color:'#f59e0b'}}>💰${tips}</div></div>
          <div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',textTransform:'uppercase'}}>Served</div><div style={{fontFamily:'Titan One,sans-serif',fontSize:'40px',color:'#22c55e'}}>✅{served}</div></div>
          <div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',textTransform:'uppercase'}}>Missed</div><div style={{fontFamily:'Titan One,sans-serif',fontSize:'40px',color:'#ef4444'}}>😤{missed}</div></div>
        </div>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Play Again</button>
          <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const tablePos = TABLE_POSITIONS[tableIdx % TABLE_POSITIONS.length];
  const patiencePct = timeLeft/15*100;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1a0a20,#0d0518)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes tipFloat{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-60px) scale(1.2);opacity:0}}
        @keyframes waiterWalk{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes tablePulse{0%,100%{filter:drop-shadow(0 0 6px rgba(167,139,250,0.6))}50%{filter:drop-shadow(0 0 14px rgba(167,139,250,1))}}
        @keyframes served{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1);opacity:0.5}}
      `}</style>

      {/* HUD */}
      <div style={{background:'rgba(0,0,0,0.6)',borderBottom:'2px solid rgba(124,58,237,0.3)',padding:'10px 20px',display:'flex',gap:'16px',alignItems:'center'}}>
        <div style={{fontWeight:'800',color:'#f59e0b',fontSize:'15px'}}>💰 ${tips} tips</div>
        <div style={{fontWeight:'800',color:'#22c55e',fontSize:'15px'}}>✅ {served}</div>
        <div style={{fontWeight:'800',color:'#ef4444',fontSize:'15px'}}>😤 {missed}</div>
        {streak>=2 && <div style={{background:'rgba(167,139,250,0.15)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'8px',padding:'3px 10px',fontSize:'12px',color:'#a78bfa',fontWeight:'800'}}>🔥{streak}x</div>}
        <div style={{flex:1}}/>
        <div style={{background:timeLeft<=5?'rgba(239,68,68,0.2)':'rgba(124,58,237,0.1)',border:`1px solid ${timeLeft<=5?'#ef4444':'rgba(124,58,237,0.3)'}`,borderRadius:'8px',padding:'4px 12px',fontWeight:'800',color:timeLeft<=5?'#ef4444':'#c4b5fd',fontSize:'15px'}}>{timeLeft}s</div>
      </div>

      {/* CAFÉ INTERIOR */}
      <div style={{flex:'0 0 auto',height:'calc(100vh - 240px)',minHeight:'260px',position:'relative',overflow:'hidden',background:'linear-gradient(180deg,#2a1835,#1a0e22)'}}>
        {/* Wallpaper */}
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.02) 28px,rgba(255,255,255,0.02) 29px)',pointerEvents:'none'}} />

        {/* Windows */}
        {[12,75].map((x,i) => (
          <div key={i} style={{position:'absolute',top:'5%',left:x+'%',width:'80px',height:'60px',background:'linear-gradient(135deg,#87ceeb44,#b0e2ff22)',border:'3px solid rgba(255,255,255,0.15)',borderRadius:'6px',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'50%',left:0,right:0,height:'2px',background:'rgba(255,255,255,0.2)'}} />
            <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:'2px',background:'rgba(255,255,255,0.2)'}} />
          </div>
        ))}

        {/* Floor */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'15%',background:'#1a0e22',borderTop:'2px solid rgba(124,58,237,0.2)',backgroundImage:'repeating-linear-gradient(90deg,transparent 0px,transparent 38px,rgba(124,58,237,0.05) 38px,rgba(124,58,237,0.05) 40px)'}} />

        {/* Counter at top */}
        <div style={{position:'absolute',top:'62%',left:0,right:0,height:'28px',background:'#3a2050',borderTop:'3px solid #6a3a9a',borderBottom:'2px solid #2a1040',display:'flex',alignItems:'center',gap:'12px',padding:'0 20px'}}>
          {['☕','🍰','🧁','🍵','🥐','🍩','🧋'].map((e,i) => <span key={i} style={{fontSize:'16px',filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'}}>{e}</span>)}
        </div>

        {/* ALL TABLES */}
        {TABLE_POSITIONS.map((pos,i) => {
          const isActive = i === tableIdx % TABLE_POSITIONS.length;
          const isDone = servedTables.includes(i);
          const cust = CUSTOMERS[i % CUSTOMERS.length];
          return (
            <div key={i} style={{position:'absolute',left:pos.x+'%',top:pos.y+'%',textAlign:'center',opacity:isDone?0.5:1}}>
              {/* Speech bubble on active table */}
              {isActive && !selected && (
                <div style={{position:'absolute',top:'-48px',left:'50%',transform:'translateX(-50%)',background:'rgba(255,255,255,0.95)',borderRadius:'10px',padding:'6px 10px',fontSize:'12px',color:'#000',fontWeight:'700',whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',zIndex:5}}>
                  {cust.order}
                  <div style={{position:'absolute',bottom:'-6px',left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderTop:'6px solid rgba(255,255,255,0.95)'}} />
                </div>
              )}
              {/* Patience bar on active table */}
              {isActive && (
                <div style={{position:'absolute',top:'-8px',left:'-4px',right:'-4px',height:'4px',background:'rgba(0,0,0,0.3)',borderRadius:'2px',overflow:'hidden',zIndex:4}}>
                  <div style={{height:'100%',width:patiencePct+'%',background:timeLeft<=5?'#ef4444':timeLeft<=8?'#f59e0b':'#a78bfa',borderRadius:'2px',transition:'width 1s linear'}} />
                </div>
              )}
              {/* Table */}
              <div style={{fontSize:'28px',animation:isActive?'tablePulse 1.5s ease-in-out infinite':'none',filter:isDone?'grayscale(1)':'none'}}>🪑</div>
              {/* Customer blook */}
              <div style={{position:'absolute',top:'-2px',left:'50%',transform:'translateX(-50%)',fontSize:isActive?'22px':'18px'}}>{isDone?'😊':cust.blook}</div>
            </div>
          );
        })}

        {/* WAITER (player) */}
        <div style={{position:'absolute',left:waiterPos.x+'%',top:waiterPos.y+'%',fontSize:'28px',transition:'left 0.5s ease-out,top 0.5s ease-out',animation:'waiterWalk 0.5s ease-in-out infinite',zIndex:10,transform:'translateX(-50%)',filter:'drop-shadow(1px 2px 4px rgba(0,0,0,0.5))'}}>⭐</div>

        {/* Tip animation */}
        {tipAnim && (
          <div style={{position:'absolute',left:tablePos.x+'%',top:(tablePos.y-5)+'%',fontSize:'16px',fontWeight:'900',color:tipAnim.color,animation:'tipFloat 1.5s ease-out forwards',pointerEvents:'none',whiteSpace:'nowrap',zIndex:20,textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>
            {tipAnim.text}
          </div>
        )}
      </div>

      {/* QUESTION PANEL */}
      <div style={{background:'#0d0518',borderTop:'3px solid rgba(124,58,237,0.4)',padding:'14px 16px',flex:'0 0 auto'}}>
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
    </div>
  );
}

function Loader(){return <div style={{minHeight:'100vh',background:'#1a0a20',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>Loading...</div>;}
function NoQ({navigate}){return <div style={{minHeight:'100vh',background:'#1a0a20',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',margin:'16px 0 8px'}}>No Questions</h2><button onClick={()=>navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button></div></div>;}
