import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const ANS_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const ANS_ICONS = ['▲','◆','●','■'];
const BOT_BLOOKS = ['🐱','🦊','🐸','🐼','🐯','🦁','🐺'];
const BOT_NAMES = ['BlookBot','PixelPro','QuizKing','SwiftAce','NeonNinja','GoldRush','IronFox'];
const ARENA_POSITIONS = [
  {x:10,y:20},{x:30,y:15},{x:55,y:22},{x:75,y:18},{x:85,y:40},
  {x:70,y:60},{x:40,y:65},{x:15,y:55},
];

export default function BattleRoyale() {
  const navigate = useNavigate();
  const { questions, loading, error } = useGameQuestions();
  const [phase, setPhase] = useState('lobby');
  const [lives, setLives] = useState(3);
  const [kills, setKills] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [players, setPlayers] = useState([]);
  const [zoneSize, setZoneSize] = useState(100); // shrinks over time
  const [elimAnim, setElimAnim] = useState(null); // {idx, correct}
  const [feed, setFeed] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const initPlayers = () => {
    const list = [
      { name:'You', blook:'⭐', lives:3, alive:true, isMe:true, pos:ARENA_POSITIONS[0] },
      ...BOT_NAMES.slice(0,7).map((name,i) => ({
        name, blook:BOT_BLOOKS[i], lives:3, alive:true, isMe:false,
        pos:ARENA_POSITIONS[i+1],
      })),
    ];
    setPlayers(list);
  };

  const addFeed = (msg) => setFeed(f => [{ msg, id:Date.now() }, ...f].slice(0,4));

  const startTimer = () => {
    setTimeLeft(15);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);onTimeout();return 0;} return t-1; });
    },1000);
  };

  const botTick = () => {
    setPlayers(prev => prev.map(p => {
      if(p.isMe || !p.alive) return p;
      if(Math.random() < 0.3) { // 30% chance bot messes up
        const nl = p.lives-1;
        if(nl<=0) {
          setTimeout(()=>addFeed(`💀 ${p.name} eliminated!`),100);
          return {...p, lives:0, alive:false};
        }
        return {...p, lives:nl};
      }
      return p;
    }));
    setZoneSize(z => Math.max(40, z-3));
  };

  const onTimeout = () => {
    setCorrectIdx(questions[currentQ]?.correct);
    setSelected(-1);
    const nl = lives-1;
    setLives(nl);
    addFeed(`⏱️ You timed out! ${nl} lives left`);
    if(nl<=0){ setTimeout(()=>{ setPhase('gameover'); sounds.gameOver(); },1500); return; }
    botTick();
    setTimeout(()=>nextQ(),2000);
  };

  const handleAnswer = (idx) => {
    if(selected!==null) return;
    clearInterval(timerRef.current);
    const q = questions[currentQ];
    setSelected(idx);
    setCorrectIdx(q.correct);
    if(idx===q.correct) {
      setKills(k=>k+1);
      addFeed(`✅ You got it! +1 elimination`);
      // Eliminate a random bot
      setPlayers(prev => {
        const alive = prev.filter(p=>!p.isMe&&p.alive);
        if(!alive.length) return prev;
        const target = alive[Math.floor(Math.random()*alive.length)];
        setElimAnim(target.pos);
        setTimeout(()=>setElimAnim(null),800);
        setTimeout(()=>addFeed(`💀 ${target.name} eliminated!`),200);
        return prev.map(p=>p.name===target.name?{...p,lives:0,alive:false}:p);
      });
    } else {
      const nl=lives-1;
      setLives(nl);
      addFeed(`❌ Wrong! ${nl} lives left`);
      setElimAnim(ARENA_POSITIONS[0]);
      setTimeout(()=>setElimAnim(null),800);
      if(nl<=0){ clearInterval(timerRef.current); setTimeout(()=>{ setPhase('gameover'); sounds.gameOver(); },1800); return; }
    }
    botTick();
    setTimeout(()=>nextQ(),1800);
  };

  const nextQ = () => {
    setSelected(null);
    setCorrectIdx(null);
    const next=currentQ+1;
    if(next>=questions.length){setPhase('victory');return;}
    setCurrentQ(next);
    startTimer();
  };

  const startGame = () => { sounds.click();
    initPlayers();
    setPhase('question');
    setLives(3); setKills(0);
    setCurrentQ(0);
    setFeed([]);
    setZoneSize(100);
    startTimer();
  };

  if(loading) return <Loader/>;
  if(error||!questions.length) return <NoQ navigate={navigate}/>;

  if(phase==='lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0d0020,#150030)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>
      <button onClick={()=>navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(236,72,153,0.15)',border:'1px solid rgba(236,72,153,0.3)',borderRadius:'10px',color:'#f472b6',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
      {/* Arena preview */}
      <div style={{width:'360px',height:'200px',background:'linear-gradient(135deg,#1a0030,#0d0020)',borderRadius:'16px',border:'3px solid #4a1070',marginBottom:'28px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
        {/* Zone ring */}
        <div style={{position:'absolute',top:'50%',left:'50%',width:'80%',height:'80%',transform:'translate(-50%,-50%)',border:'3px solid rgba(236,72,153,0.4)',borderRadius:'50%'}} />
        {/* Blooks in arena */}
        {ARENA_POSITIONS.slice(0,6).map((p,i) => (
          <div key={i} style={{position:'absolute',left:p.x+'%',top:p.y+'%',fontSize:i===0?'22px':'16px',filter:i===0?'drop-shadow(0 0 6px #f472b6)':'none'}}>
            {i===0?'⭐':BOT_BLOOKS[i-1]}
          </div>
        ))}
        <div style={{position:'absolute',bottom:'8px',left:'50%',transform:'translateX(-50%)',fontSize:'11px',color:'rgba(236,72,153,0.8)',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase'}}>Battle Arena</div>
      </div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',color:'#ec4899',margin:'0 0 8px',textShadow:'0 2px 20px rgba(236,72,153,0.5)'}}>Battle Royale</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'12px',fontSize:'15px'}}>8 players • Last blook standing wins!</p>
      <div style={{display:'flex',gap:'10px',marginBottom:'28px',flexWrap:'wrap',justifyContent:'center'}}>
        {['💚 3 lives','❌ Wrong = lose a life','💀 Last one standing wins'].map(t=>(
          <div key={t} style={{background:'rgba(236,72,153,0.1)',border:'1px solid rgba(236,72,153,0.2)',borderRadius:'99px',padding:'5px 12px',fontSize:'12px',color:'#f472b6',fontWeight:'600'}}>{t}</div>
        ))}
      </div>
      <button onClick={startGame} style={{padding:'16px 52px',background:'linear-gradient(135deg,#be185d,#9d174d)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(190,24,93,0.5)'}}>⚔️ Enter Arena</button>
    </div>
  );

  if(phase==='gameover') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0d0020,#150030)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'72px'}}>💔</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#ec4899',margin:0}}>Eliminated!</h1>
      <p style={{color:'rgba(255,255,255,0.4)'}}>Reached Q{currentQ+1} • {kills} eliminations</p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#be185d,#9d174d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Try Again</button>
        <button onClick={()=>navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  if(phase==='victory') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0d0020,#150030)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{fontSize:'72px'}}>👑</div>
      <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#f59e0b',margin:0}}>Winner!</h1>
      <p style={{color:'rgba(255,255,255,0.4)'}}>💚 {lives} lives left • ⚔️ {kills} eliminations</p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:'10px',color:'#000',fontWeight:'700',cursor:'pointer'}}>Play Again</button>
        <button onClick={()=>navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  const alivePct = players.filter(p=>p.alive).length;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#0d0020,#150030)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes elimFlash{0%{transform:scale(1)}30%{transform:scale(2) rotate(20deg);opacity:0.5}100%{transform:scale(0);opacity:0}}
        @keyframes zoneShimmer{0%,100%{opacity:0.4}50%{opacity:0.7}}
        @keyframes blookBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes feedFade{0%{transform:translateX(20px);opacity:0}20%{transform:translateX(0);opacity:1}80%{opacity:1}100%{opacity:0}}
      `}</style>

      {/* HUD */}
      <div style={{background:'rgba(0,0,0,0.7)',borderBottom:'2px solid rgba(236,72,153,0.3)',padding:'10px 20px',display:'flex',gap:'16px',alignItems:'center'}}>
        <div style={{display:'flex',gap:'4px'}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:'18px',opacity:i<lives?1:0.2}}>💚</span>)}</div>
        <div style={{fontWeight:'800',color:'#f59e0b',fontSize:'14px'}}>⚔️{kills} kills</div>
        <div style={{fontWeight:'800',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>👥{alivePct} alive</div>
        <div style={{flex:1}}/>
        <div style={{background:timeLeft<=5?'rgba(239,68,68,0.2)':'rgba(236,72,153,0.1)',border:`1px solid ${timeLeft<=5?'#ef4444':'rgba(236,72,153,0.3)'}`,borderRadius:'8px',padding:'4px 12px',fontWeight:'800',color:timeLeft<=5?'#ef4444':'#f472b6',fontSize:'15px'}}>{timeLeft}s</div>
      </div>

      {/* ARENA */}
      <div style={{flex:'0 0 auto',height:'calc(100vh - 240px)',minHeight:'260px',position:'relative',overflow:'hidden'}}>
        {/* Background */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%,#1a0030 0%,#0d0020 100%)'}} />
        {/* Grid pattern */}
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(236,72,153,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(236,72,153,0.04) 1px,transparent 1px)',backgroundSize:'50px 50px'}} />

        {/* ZONE (shrinking circle) */}
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:zoneSize+'%',height:zoneSize+'%',border:'3px solid rgba(236,72,153,0.6)',borderRadius:'50%',animation:'zoneShimmer 2s ease-in-out infinite',pointerEvents:'none',transition:'width 0.5s,height 0.5s'}}>
          <div style={{position:'absolute',inset:'-6px',border:'2px dashed rgba(236,72,153,0.2)',borderRadius:'50%'}} />
        </div>

        {/* PLAYERS in arena */}
        {players.map((p,i) => (
          <div key={i} style={{position:'absolute',left:p.pos.x+'%',top:p.pos.y+'%',textAlign:'center',opacity:p.alive?1:0,transition:'opacity 0.5s'}}>
            <div style={{fontSize:p.isMe?'32px':'24px',animation:p.alive?'blookBob 1s ease-in-out infinite':'none',animationDelay:i*0.2+'s',filter:elimAnim===p.pos?'brightness(3)':'none',display:'inline-block'}}>
              {p.blook}
            </div>
            <div style={{fontSize:'8px',color:p.isMe?'#f59e0b':'rgba(255,255,255,0.4)',fontWeight:'700',marginTop:'1px',textShadow:'0 1px 3px rgba(0,0,0,0.8)'}}>{p.name}</div>
            {/* Lives dots */}
            <div style={{display:'flex',gap:'1px',justifyContent:'center',marginTop:'1px'}}>
              {[...Array(3)].map((_,j)=><div key={j} style={{width:'4px',height:'4px',borderRadius:'50%',background:j<p.lives?'#22c55e':'rgba(255,255,255,0.15)'}} />)}
            </div>
          </div>
        ))}

        {/* ELIMINATION flash */}
        {elimAnim && (
          <div style={{position:'absolute',left:elimAnim.x+'%',top:elimAnim.y+'%',fontSize:'32px',animation:'elimFlash 0.8s forwards',pointerEvents:'none',zIndex:20}}>💥</div>
        )}

        {/* KILL FEED */}
        <div style={{position:'absolute',top:'8px',right:'8px',display:'flex',flexDirection:'column',gap:'4px',maxWidth:'180px'}}>
          {feed.slice(0,3).map((f,i) => (
            <div key={f.id} style={{background:'rgba(0,0,0,0.7)',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',color:'rgba(255,255,255,0.8)',animation:'feedFade 3s forwards',backdropFilter:'blur(4px)'}}>{f.msg}</div>
          ))}
        </div>

        {/* Zone label */}
        <div style={{position:'absolute',bottom:'8px',left:'50%',transform:'translateX(-50%)',fontSize:'11px',color:'rgba(236,72,153,0.6)',fontWeight:'700',letterSpacing:'1px'}}>ZONE {Math.floor((100-zoneSize)/10)+1}</div>
      </div>

      {/* QUESTION PANEL */}
      <div style={{background:'#0d0020',borderTop:'3px solid rgba(236,72,153,0.4)',padding:'14px 16px',flex:'0 0 auto'}}>
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

function Loader(){return <div style={{minHeight:'100vh',background:'#0d0020',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>Loading...</div>;}
function NoQ({navigate}){return <div style={{minHeight:'100vh',background:'#0d0020',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',margin:'16px 0 8px'}}>No Questions</h2><button onClick={()=>navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#be185d,#9d174d)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back</button></div></div>;}
