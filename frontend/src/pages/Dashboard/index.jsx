import DevPanel from './DevPanel';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PACK_EMOJIS = {
  'Starter Pack': '🎮',
  'Animal Pack': '🐻',
  'Ocean Pack': '🌊',
  'Space Pack': '🚀',
  'Food Pack': '🍕',
  'Medieval Pack': '⚔️',
  'Horror Pack': '👻',
  'Nature Pack': '🌿',
  'Weather Pack': '⛈️',
  'Mystery Pack': '❓',
  'Legend Pack': '👑'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('profile');
  const [blooks, setBlooks] = useState([]);
  const [packs, setPacks] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [quests, setQuests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allSets, setAllSets] = useState([]);
  const [creatingSet, setCreatingSet] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [newSetQuestions, setNewSetQuestions] = useState([{question:'',answers:['','','',''],correct:0}]);
  const [friendInput, setFriendInput] = useState('');
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [marketResult, setMarketResult] = useState(null);
  const [marketOpening, setMarketOpening] = useState(false);
  const [marketActivePack, setMarketActivePack] = useState(null);
  const [marketError, setMarketError] = useState('');
  const [marketSpinEmojis, setMarketSpinEmojis] = useState(['🎴','🎴','🎴','🎴','🎴','🎴','🎴']);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, [navigate, token]);

  const loadData = () => {
    axios.get('/api/users/me', { headers: { authorization: token } }).then(r => setUser(r.data)).catch(() => navigate('/login'));
    axios.get('/api/users/blooks', { headers: { authorization: token } }).then(r => setBlooks(r.data)).catch(() => {});
    axios.get('/api/packs').then(r => setPacks(r.data)).catch(() => {});
    axios.get('/api/leaderboard').then(r => setLeaderboard(r.data)).catch(() => {});
    axios.get('/api/quests/user', { headers: { authorization: token } }).then(r => setQuests(r.data.quests || [])).catch(() => {});
    axios.get('/api/friends', { headers: { authorization: token } }).then(r => setFriends(r.data)).catch(() => {});
    axios.get('/api/sets', { headers: { authorization: token } }).then(r => setAllSets(r.data)).catch(() => {});
    axios.get('/api/users/notifications', { headers: { authorization: token } }).then(r => { setNotifs(r.data.notifications || []); setUnreadCount(r.data.unread || 0); }).catch(() => {});
  };

  const openMarketPack = async (pack) => {
    setMarketOpening(true);
    setMarketActivePack(pack);
    setMarketError('');
    setMarketResult(null);
    const allEmojis = ['🎴','🃏','🎲','⭐','🌟','💫','✨','🔮','💎','🎁','🎊','🎉','👾','🦄','🐉','👑','🔥','⚡','🌈','🎯'];
    const spinInterval = setInterval(() => {
      setMarketSpinEmojis(Array(7).fill(null).map(() => allEmojis[Math.floor(Math.random()*allEmojis.length)]));
    }, 80);
    try {
      const res = await axios.post('/api/buy-pack', { pack: pack.id }, { headers: { authorization: token } });
      clearInterval(spinInterval);
      await new Promise(r => setTimeout(r, 400));
      setUser(u => ({ ...u, tokens: res.data.user.tokens }));
      setMarketResult(res.data);
      loadData();
    } catch (err) {
      clearInterval(spinInterval);
      setMarketError(err?.response?.data?.error || 'Failed to open pack');
    }
    setMarketOpening(false);
  };

  const equipBlook = (blookName) => {
    axios.post('/api/users/equip-blook', { blook: blookName }, { headers: { authorization: token } })
      .then(res => {
        setUser(res.data.user);
        loadData();
      })
      .catch(e => alert('Failed to equip'));
  };

  if (!user) return <div style={{color:'#fff',padding:'20px'}}>Loading...</div>;

  const NavBtn = ({ id, icon, label }) => (
    <button onClick={() => setPage(id)} style={{width:'100%',display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',marginBottom:'6px',background:page===id?'rgba(99,102,241,0.25)':'transparent',border:'none',color:page===id?'#a5b4fc':'rgba(255,255,255,0.4)',cursor:'pointer',borderRadius:'8px',fontWeight:'500',fontSize:'13px',textAlign:'left',transition:'all 0.2s'}}>
      <span style={{fontSize:'16px',width:'20px'}}>{icon}</span><span>{label}</span>
    </button>
  );

  return (
    <div style={{display:'flex',height:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',overflow:'hidden'}}>
      <div style={{width:'175px',background:'linear-gradient(180deg,#0a0f2e 0%,#060918 100%)',borderRight:'1px solid rgba(99,102,241,0.15)',padding:'16px 12px',display:'flex',flexDirection:'column',overflowY:'auto',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px',paddingLeft:'4px'}}>
          <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#f59e0b,#ef4444)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',color:'white',fontSize:'16px',boxShadow:'0 4px 12px rgba(245,158,11,0.4)'}}>L</div>
          <div style={{fontSize:'20px',fontWeight:'900',fontFamily:"'Titan One',sans-serif",color:'#fff',letterSpacing:'-0.5px'}}>Lacket</div>
        </div>

        <div style={{background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',padding:'10px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',transition:'all 0.2s'}}>
          <img src={`/content/blooks/${user.equipped_blook}${user.equipped_blook&&user.equipped_blook.includes('.')?'':'.png'}`} onError={(e)=>{e.target.src='/content/blooks/Default.png'}} style={{width:'32px',height:'32px',borderRadius:'5px',objectFit:'contain'}} />
          <div style={{fontSize:'11px',flex:1,minWidth:0}}>
            <div style={{fontWeight:'700',color:'#e0e7ff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.username}</div>
            <div style={{fontSize:'10px',color:'#f59e0b'}}>🪙 {(user.tokens||0)?.toLocaleString()}</div>
          </div>
          <div style={{position:'relative'}} onClick={e=>{e.stopPropagation();setShowNotifs(v=>!v);}}>
            <div style={{fontSize:'18px',cursor:'pointer',lineHeight:1}}>🔔</div>
            {unreadCount>0&&<div style={{position:'absolute',top:'-4px',right:'-4px',background:'#ef4444',color:'#fff',borderRadius:'50%',width:'14px',height:'14px',fontSize:'9px',fontWeight:'800',display:'flex',alignItems:'center',justifyContent:'center'}}>{unreadCount>9?'9+':unreadCount}</div>}
          </div>
        </div>
        {showNotifs&&(
          <div style={{background:'#0d1240',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',marginBottom:'12px',maxHeight:'220px',overflowY:'auto',fontSize:'12px'}}>
            <div style={{padding:'8px 10px',borderBottom:'1px solid rgba(99,102,241,0.2)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:'700',color:'#a5b4fc'}}>Notifications</span>
              {unreadCount>0&&<button onClick={()=>{axios.post('/api/users/notifications-read',{},{headers:{authorization:token}}).then(()=>{setUnreadCount(0);setNotifs(n=>n.map(x=>({...x,read_at:new Date()})));});}} style={{background:'none',border:'none',color:'#6366f1',cursor:'pointer',fontSize:'11px',fontWeight:'700'}}>Mark all read</button>}
            </div>
            {notifs.length===0?<div style={{padding:'12px',color:'rgba(255,255,255,0.3)',textAlign:'center'}}>No notifications</div>:notifs.slice(0,10).map((n,i)=>(
              <div key={i} style={{padding:'8px 10px',borderBottom:'1px solid rgba(99,102,241,0.1)',background:n.read_at?'transparent':'rgba(99,102,241,0.08)'}}>
                <div style={{fontWeight:'600',color:'#e0e7ff',marginBottom:'2px'}}>{n.title||n.type}</div>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'11px'}}>{n.message}</div>
              </div>
            ))}
          </div>
        )}

        <nav style={{flex:1,fontSize:'13px'}}>
          <NavBtn id="profile" icon="👤" label="Profile" />
          <NavBtn id="blooks" icon="🃏" label="Blooks" />
          <NavBtn id="market" icon="🛒" label="Market" />
          <NavBtn id="play" icon="🎮" label="Play" />
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.2)',textTransform:'uppercase',fontWeight:'700',padding:'10px 14px 6px',marginTop:'8px',letterSpacing:'0.5px'}}>Other</div>
          <NavBtn id="sets" icon="📝" label="My Sets" />
          <NavBtn id="discover" icon="🔍" label="Discover" />
          <NavBtn id="chat" icon="💬" label="Chat" />
          <NavBtn id="friends" icon="👥" label="Friends" />
          <NavBtn id="leaderboard" icon="🏆" label="Leaderboard" />
          <NavBtn id="settings" icon="⚙️" label="Settings" />
          {user.role==='Dev'&&<NavBtn id="devpanel" icon="🛠️" label="Dev Panel" />}
        </nav>

        <button onClick={() => {localStorage.removeItem('token');navigate('/');}} style={{width:'100%',padding:'11px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',cursor:'pointer',borderRadius:'8px',fontWeight:'600',fontSize:'13px',marginTop:'12px'}}>Logout</button>
      </div>

      <div style={{flex:1,padding:'28px 32px',overflowY:'auto',background:'#05071a'}}>
        {page==='profile'&&(<div>
          <style>{`
            @keyframes profileFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          `}</style>
          {/* Hero banner */}
          <div style={{background:'linear-gradient(135deg,#1a0533,#0d1240,#051a40)',borderRadius:'20px',padding:'32px',marginBottom:'20px',position:'relative',overflow:'hidden',border:'1px solid rgba(99,102,241,0.25)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(ellipse at 20% 50%,rgba(245,158,11,0.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(99,102,241,0.1) 0%,transparent 60%)',pointerEvents:'none'}} />
            <div style={{display:'flex',alignItems:'center',gap:'28px',position:'relative'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:'100px',height:'100px',background:'linear-gradient(135deg,#f59e0b22,#6366f122)',borderRadius:'20px',border:'2px solid rgba(245,158,11,0.4)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(245,158,11,0.15)'}}>
                  <img src={`/content/blooks/${user.equipped_blook}${user.equipped_blook&&user.equipped_blook.includes('.')?'':'.png'}`} onError={(e)=>{e.target.src='/content/blooks/Default.png'}} style={{width:'80px',height:'80px',objectFit:'contain',animation:'profileFloat 3s ease-in-out infinite'}} />
                </div>
                {user.role==='Dev'&&<div style={{position:'absolute',bottom:'-6px',right:'-6px',background:'linear-gradient(135deg,#f59e0b,#ef4444)',borderRadius:'6px',padding:'2px 8px',fontSize:'10px',fontWeight:'800',color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.5)'}}>DEV</div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'28px',fontWeight:'900',fontFamily:"'Titan One',sans-serif",marginBottom:'4px',color:'#fff'}}>{user.username}</div>
                <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',marginBottom:'16px'}}>Member since {new Date(user.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long'})}</div>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                  <div style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.35)',borderRadius:'12px',padding:'10px 18px',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'900',color:'#f59e0b',lineHeight:1}}>{user.tokens?.toLocaleString()}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontWeight:'700',marginTop:'3px'}}>🪙 Tokens</div>
                  </div>
                  <div style={{background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.35)',borderRadius:'12px',padding:'10px 18px',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'900',color:'#a5b4fc',lineHeight:1}}>#{leaderboard.findIndex(u=>u.username===user.username)+1||'—'}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontWeight:'700',marginTop:'3px'}}>🏆 Rank</div>
                  </div>
                  <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'12px',padding:'10px 18px',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'900',color:'#22c55e',lineHeight:1}}>{blooks.length}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontWeight:'700',marginTop:'3px'}}>🃏 Blooks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Blook Showcase */}
          <div style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'16px',padding:'24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <div style={{fontSize:'14px',fontWeight:'800',color:'#e0e7ff',letterSpacing:'0.5px'}}>✨ Blook Showcase</div>
              <button onClick={()=>setPage('blooks')} style={{background:'none',border:'none',color:'rgba(99,102,241,0.7)',fontSize:'12px',fontWeight:'700',cursor:'pointer',padding:0}}>View all →</button>
            </div>
            {blooks.length===0
              ?<div style={{textAlign:'center',padding:'32px',color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>No blooks yet! Head to the Market to open some packs.</div>
              :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'12px'}}>
                {blooks.slice(0,10).map((b,i)=>{const RCOLORS={'Common':'#9ca3af','Uncommon':'#22c55e','Rare':'#3b9eff','Epic':'#a855f7','Legendary':'#f59e0b','Mythic':'#ef4444','Chroma':'#ec4899'};const c=RCOLORS[b.rarity]||'#6366f1';return(<div key={i} style={{background:`linear-gradient(135deg,${c}18,${c}08)`,border:`1px solid ${c}44`,borderRadius:'12px',padding:'14px',textAlign:'center'}}><img src={`/content/blooks/${b.blook_name.endsWith(".png")||b.blook_name.endsWith(".gif")?b.blook_name:b.blook_name+".png"}`} onError={(e)=>{e.target.src='/content/blooks/Default.png'}} style={{width:'55px',height:'55px',marginBottom:'8px',objectFit:'contain'}} /><div style={{fontSize:'11px',color:'#e0e7ff',fontWeight:'700',marginBottom:'3px'}}>{b.blook_name.replace(/\.(png|gif)/,'')}</div><div style={{fontSize:'9px',color:c,fontWeight:'700',textTransform:'uppercase'}}>{b.rarity}</div></div>);})}
              </div>
            }
          </div>
        </div>)}

        {page==='blooks'&&(<div><h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'8px'}}>Blooks</h1><p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Your collection ({blooks.length})</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'12px'}}>{blooks.map((b,i)=>{const isEquipped=user.equipped_blook===b.blook_name;return(<div key={i} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:isEquipped?'2px solid #a5b4fc':'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'14px',textAlign:'center',cursor:'pointer'}}><img src={`/content/blooks/${b.blook_name.endsWith(".png")||b.blook_name.endsWith(".gif")?b.blook_name:b.blook_name+".png"}`} onError={(e)=>{e.target.src='/content/blooks/Default.png'}} style={{width:'70px',height:'70px',marginBottom:'8px',objectFit:'contain'}} /><div style={{fontSize:'12px',fontWeight:'700',marginBottom:'2px'}}>{b.blook_name.replace(/\.(png|gif)/,'')}{b.count>1&&<span style={{marginLeft:'5px',background:'rgba(99,102,241,0.4)',borderRadius:'6px',padding:'1px 6px',fontSize:'10px',fontWeight:'800',color:'#c7d2fe'}}>x{b.count}</span>}</div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',marginBottom:'8px',textTransform:'uppercase',fontWeight:'600'}}>{b.rarity}</div><button onClick={()=>equipBlook(b.blook_name)} style={{width:'100%',padding:'6px',background:isEquipped?'rgba(165,180,252,0.2)':'rgba(99,102,241,0.1)',border:isEquipped?'1px solid #a5b4fc':'1px solid rgba(99,102,241,0.2)',color:isEquipped?'#a5b4fc':'rgba(255,255,255,0.6)',cursor:'pointer',borderRadius:'6px',fontWeight:'600',fontSize:'11px',transition:'all 0.2s'}}>{isEquipped?'✓ Equipped':'Equip'}</button></div>)})}</div></div>)}

        {page==='market'&&(<div>
          <style>{`
            @keyframes mSpin{0%{transform:translateY(0)}100%{transform:translateY(-1400%)}}
            @keyframes mPop{0%{transform:scale(0.3);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
            @keyframes mParticle{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--tx),var(--ty));opacity:0}}
            @keyframes mGlow{0%,100%{box-shadow:var(--glow)}50%{box-shadow:var(--glow2)}}
          `}</style>
          <h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'8px',fontFamily:"'Titan One',sans-serif"}}>Market</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Open packs to get blooks</p>
          {marketError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'10px 16px',color:'#f87171',marginBottom:'16px',fontSize:'14px'}}>{marketError}</div>}
          {(marketOpening||marketResult)&&(
            <div style={{position:'fixed',inset:0,background:'rgba(2,4,20,0.98)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,backdropFilter:'blur(8px)'}} onClick={marketResult?()=>setMarketResult(null):undefined}>
              <div style={{textAlign:'center',maxWidth:'480px',width:'90%',padding:'40px'}} onClick={e=>e.stopPropagation()}>
                {marketOpening&&!marketResult&&(<>
                  <div style={{fontSize:'18px',fontWeight:'800',color:'rgba(255,255,255,0.5)',marginBottom:'24px',letterSpacing:'2px',textTransform:'uppercase'}}>Opening {marketActivePack?.id}...</div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'center',overflow:'hidden',height:'80px',alignItems:'center',marginBottom:'24px'}}>
                    {marketSpinEmojis.map((em,i)=>(<div key={i} style={{fontSize:'48px',width:'72px',height:'72px',display:'flex',alignItems:'center',justifyContent:'center',background:i===3?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.03)',borderRadius:'12px',border:i===3?'2px solid rgba(99,102,241,0.5)':'1px solid rgba(255,255,255,0.05)',transition:'all 0.1s'}}>{em}</div>))}
                  </div>
                  <div style={{color:'rgba(255,255,255,0.3)',fontSize:'14px'}}>✨ Rolling...</div>
                </>)}
                {marketResult&&(<>
                  <div style={{position:'relative',display:'inline-block',marginBottom:'20px'}}>
                    {[...Array(32)].map((_,i)=>{const rc={'Common':'#9ca3af','Uncommon':'#22c55e','Rare':'#3b9eff','Epic':'#a855f7','Legendary':'#f59e0b','Mythic':'#ef4444','Chroma':'#ec4899'}[marketResult.rarity]||'#6366f1';return(<div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'8px',height:'8px',borderRadius:'50%',background:rc,animation:'mParticle 1s ease-out forwards','--tx':(Math.cos(i/32*Math.PI*2)*140)+'px','--ty':(Math.sin(i/32*Math.PI*2)*140)+'px',animationDelay:(i*0.02)+'s'}}/>);})}
                    <img src={`/content/blooks/${marketResult.blook}`} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'150px',height:'150px',objectFit:'contain',animation:'mPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',filter:`drop-shadow(0 0 40px ${ {'Common':'#9ca3af','Uncommon':'#22c55e','Rare':'#3b9eff','Epic':'#a855f7','Legendary':'#f59e0b','Mythic':'#ef4444','Chroma':'#ec4899'}[marketResult.rarity]||'#6366f1'})`}} />
                  </div>
                  <div style={{fontFamily:"'Titan One',sans-serif",fontSize:'36px',color:{'Common':'#9ca3af','Uncommon':'#22c55e','Rare':'#3b9eff','Epic':'#a855f7','Legendary':'#f59e0b','Mythic':'#ef4444','Chroma':'#ec4899'}[marketResult.rarity],marginBottom:'6px',textShadow:`0 0 20px ${ {'Common':'#9ca3af','Uncommon':'#22c55e','Rare':'#3b9eff','Epic':'#a855f7','Legendary':'#f59e0b','Mythic':'#ef4444','Chroma':'#ec4899'}[marketResult.rarity]}`}}>{marketResult.rarity}!</div>
                  <div style={{fontSize:'24px',fontWeight:'800',color:'#e0e7ff',marginBottom:'28px'}}>{marketResult.blook.replace(/\.(png|gif)/,'')}</div>
                  <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                    <button onClick={()=>{setMarketResult(null);openMarketPack(marketActivePack);}} disabled={user.tokens<marketActivePack?.price} style={{padding:'12px 28px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',fontWeight:'700',cursor:'pointer',opacity:user.tokens>=marketActivePack?.price?1:0.4}}>Open Again</button>
                    <button onClick={()=>setMarketResult(null)} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>Close</button>
                  </div>
                </>)}
              </div>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'14px'}}>
            {Object.entries(packs).map(([packName,pack])=>{
              const PEMOJIS={'Starter Pack':'🎮','Animal Pack':'🐻','Ocean Pack':'🌊','Space Pack':'🚀','Food Pack':'🍕','Medieval Pack':'⚔️','Horror Pack':'👻','Nature Pack':'🌿','Weather Pack':'⛈️','Mystery Pack':'🎭','Legend Pack':'👑'};
              const PCOLORS={'Starter Pack':'#6366f1','Animal Pack':'#22c55e','Ocean Pack':'#0ea5e9','Space Pack':'#8b5cf6','Food Pack':'#ef4444','Medieval Pack':'#6b7280','Horror Pack':'#7c3aed','Nature Pack':'#16a34a','Weather Pack':'#0284c7','Mystery Pack':'#ec4899','Legend Pack':'#f59e0b'};
              const color=PCOLORS[packName]||'#6366f1';
              return(<div key={packName} style={{background:`linear-gradient(135deg,${color}22,#0a0f2e)`,border:`1px solid ${color}44`,borderRadius:'14px',padding:'18px',textAlign:'center',cursor:marketOpening?'not-allowed':'pointer',transition:'all 0.2s'}} onClick={()=>!marketOpening&&openMarketPack({id:packName,price:pack.price,color})}>
                <div style={{fontSize:'36px',marginBottom:'8px'}}>{PEMOJIS[packName]||'📦'}</div>
                <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'4px',color:'#e0e7ff'}}>{packName}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'10px'}}>{Object.keys(pack.blooks||{}).length} blooks</div>
                <button disabled={user.tokens<pack.price||marketOpening} style={{width:'100%',padding:'8px',background:user.tokens>=pack.price?`linear-gradient(135deg,${color},${color}99)`:'rgba(255,255,255,0.05)',border:'none',borderRadius:'8px',color:user.tokens>=pack.price?'#fff':'rgba(255,255,255,0.3)',fontFamily:'Nunito,sans-serif',fontWeight:'700',fontSize:'13px',cursor:user.tokens>=pack.price&&!marketOpening?'pointer':'not-allowed'}}>
                  {marketOpening&&marketActivePack?.id===packName?'Opening...':user.tokens<pack.price?'🔒 '+pack.price:'🪙 '+pack.price}
                </button>
              </div>);
            })}
          </div>
        </div>)}

        {page==='leaderboard'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'900',marginBottom:'4px',fontFamily:"'Titan One',sans-serif"}}>Leaderboard</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Top Lacket players</p>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {leaderboard.slice(0,20).map((u,i)=>{
              const medals=['🥇','🥈','🥉'];
              const topColors=['linear-gradient(135deg,#f59e0b22,#0d1240)','linear-gradient(135deg,#c0c0c022,#0d1240)','linear-gradient(135deg,#cd7f3222,#0d1240)'];
              const topBorders=['rgba(245,158,11,0.4)','rgba(192,192,192,0.3)','rgba(205,127,50,0.3)'];
              return(<div key={i} onClick={()=>window.open(`/u/${u.username}`,'_blank')} style={{background:i<3?topColors[i]:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:`1px solid ${i<3?topBorders[i]:'rgba(99,102,241,0.15)'}`,borderRadius:'12px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'14px',cursor:'pointer',transition:'all 0.15s'}}>
                <div style={{width:'32px',textAlign:'center',fontSize:i<3?'22px':'15px',fontWeight:'900',color:i===0?'#f59e0b':i===1?'#c0c0c0':i===2?'#cd7f32':'rgba(255,255,255,0.3)',fontFamily:"'Titan One',sans-serif"}}>{i<3?medals[i]:`#${i+1}`}</div>
                <img src={`/content/blooks/${u.equipped_blook}${u.equipped_blook&&u.equipped_blook.includes('.')?'':'.png'}`} onError={(e)=>{e.target.src='/content/blooks/Default.png'}} style={{width:'38px',height:'38px',borderRadius:'8px',objectFit:'contain'}} />
                <div style={{flex:1,fontWeight:'700',fontSize:'14px'}}>{u.username}</div>
                <div style={{fontSize:'14px',fontWeight:'800',color:'#f59e0b'}}>🪙 {u.tokens?.toLocaleString()}</div>
              </div>);
            })}
          </div>
        </div>)}

        {page==='settings'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'20px'}}>Settings</h1>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',maxWidth:'760px'}}>
            <div style={{background:'#1a1d35',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontWeight:'800',fontSize:'16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>👤 Profile</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',marginBottom:'6px'}}>Username: <strong style={{color:'#fff'}}>{user.username}</strong></div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',marginBottom:'6px'}}>Role: <strong style={{color:'#a5b4fc'}}>{user.role||'User'}</strong></div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.7)'}}>Joined: <strong style={{color:'#fff'}}>{new Date(user.created_at).toLocaleDateString()}</strong></div>
            </div>
            <div style={{background:'#1a1d35',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontWeight:'800',fontSize:'16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>📋 Account</div>
              <div style={{fontSize:'14px',color:'rgba(255,255,255,0.7)',marginBottom:'6px'}}>Tokens: <strong style={{color:'#f59e0b'}}>🪙 {user.tokens?.toLocaleString()}</strong></div>
              <button onClick={()=>navigate('/daily')} style={{marginTop:'10px',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',color:'#f59e0b',fontFamily:'Nunito,sans-serif',fontSize:'13px',fontWeight:'700',padding:'7px 14px',cursor:'pointer'}}>📅 Daily Reward</button>
            </div>
            <div style={{background:'#1a1d35',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontWeight:'800',fontSize:'16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>✏️ Edit Info</div>
              <div style={{fontSize:'14px',color:'rgba(99,102,241,0.8)',cursor:'pointer',marginBottom:'8px',textDecoration:'underline'}} onClick={()=>{const u=prompt('New username:');if(u)axios.post('/api/users/change-username',{username:u},{headers:{authorization:token}}).then(()=>loadData()).catch(e=>alert(e?.response?.data?.error||'Error'));}}>Change Username</div>
              <div style={{fontSize:'14px',color:'rgba(99,102,241,0.8)',cursor:'pointer',textDecoration:'underline'}} onClick={()=>{const p=prompt('New password:');if(p)axios.post('/api/users/change-password',{password:p},{headers:{authorization:token}}).then(()=>alert('Password changed!')).catch(e=>alert(e?.response?.data?.error||'Error'));}}>Change Password</div>
            </div>
            <div style={{background:'#1a1d35',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'20px'}}>
              <div style={{fontWeight:'800',fontSize:'16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>⚙️ General</div>
              <div style={{fontSize:'14px',color:'rgba(99,102,241,0.8)',cursor:'pointer',marginBottom:'8px',textDecoration:'underline'}} onClick={()=>navigate('/chat')}>💬 Open Chat</div>
              <div style={{fontSize:'14px',color:'rgba(239,68,68,0.8)',cursor:'pointer',textDecoration:'underline'}} onClick={()=>{if(window.confirm('Log out?')){localStorage.removeItem('token');navigate('/login');}}}>🚪 Log Out</div>
            </div>
          </div>
        </div>)}

        {page==='play'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'900',marginBottom:'4px',fontFamily:"'Titan One',sans-serif"}}>Play</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'24px'}}>Jump into a game mode</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px'}}>
            {[
              {icon:'🎮',label:'Host a Game',desc:'Create a room and invite friends to play',color:'#6366f1',action:()=>navigate('/game')},
              {icon:'🔗',label:'Join Game',desc:'Enter a game code to join someone else',color:'#22c55e',action:()=>navigate('/play')},
              {icon:'⚡',label:'Quick Play',desc:'Jump into a random game instantly',color:'#f59e0b',action:()=>navigate('/game')},
              {icon:'📚',label:'My Sets',desc:'Practice with your own question sets',color:'#ec4899',action:()=>setPage('sets')},
            ].map((m,i)=>(
              <div key={i} onClick={m.action} style={{background:`linear-gradient(135deg,${m.color}20,${m.color}08)`,border:`1px solid ${m.color}44`,borderRadius:'16px',padding:'28px',cursor:'pointer',transition:'all 0.2s',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'14px'}}>{m.icon}</div>
                <div style={{fontSize:'16px',fontWeight:'800',marginBottom:'6px',color:'#fff'}}>{m.label}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'18px'}}>{m.desc}</div>
                <div style={{background:m.color,borderRadius:'8px',padding:'8px',fontSize:'13px',fontWeight:'700',color:'#fff'}}>Let's Go →</div>
              </div>
            ))}
          </div>
        </div>)}

        {page==='sets'&&(<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div><h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'4px',fontFamily:"'Titan One',sans-serif"}}>My Sets</h1><p style={{color:'rgba(255,255,255,0.4)'}}>Your question sets</p></div>
            <button onClick={()=>setCreatingSet(true)} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 22px',cursor:'pointer'}}>+ New Set</button>
          </div>
          {creatingSet&&(<div style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'16px',padding:'24px',marginBottom:'20px'}}>
            <h2 style={{fontSize:'18px',fontWeight:'800',marginBottom:'16px'}}>Create New Set</h2>
            <input value={newSetTitle} onChange={e=>setNewSetTitle(e.target.value)} placeholder="Set title..." style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',padding:'10px 14px',marginBottom:'12px',boxSizing:'border-box'}} />
            <textarea value={newSetDesc} onChange={e=>setNewSetDesc(e.target.value)} placeholder="Description (optional)..." style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',padding:'10px 14px',marginBottom:'16px',resize:'vertical',minHeight:'70px',boxSizing:'border-box'}} />
            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><span style={{fontWeight:'700',fontSize:'14px'}}>Questions</span><button onClick={()=>setNewSetQuestions(q=>[...q,{question:'',answers:['','','',''],correct:0}])} style={{background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'8px',color:'#a5b4fc',fontSize:'12px',fontWeight:'700',padding:'5px 12px',cursor:'pointer'}}>+ Add Question</button></div>
              {newSetQuestions.map((q,qi)=>(<div key={qi} style={{background:'rgba(0,0,0,0.2)',borderRadius:'12px',padding:'14px',marginBottom:'10px',border:'1px solid rgba(99,102,241,0.1)'}}>
                <input value={q.question} onChange={e=>{const qs=[...newSetQuestions];qs[qi].question=e.target.value;setNewSetQuestions(qs);}} placeholder={`Question ${qi+1}`} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'8px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'13px',padding:'8px 12px',marginBottom:'8px',boxSizing:'border-box'}} />
                {q.answers.map((a,ai)=>(<div key={ai} style={{display:'flex',gap:'8px',marginBottom:'6px',alignItems:'center'}}>
                  <input type="radio" checked={q.correct===ai} onChange={()=>{const qs=[...newSetQuestions];qs[qi].correct=ai;setNewSetQuestions(qs);}} style={{accentColor:'#6366f1'}} />
                  <input value={a} onChange={e=>{const qs=[...newSetQuestions];qs[qi].answers[ai]=e.target.value;setNewSetQuestions(qs);}} placeholder={`Answer ${ai+1}${q.correct===ai?' (correct)':''}`} style={{flex:1,background:'rgba(255,255,255,0.05)',border:`1px solid ${q.correct===ai?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:'8px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'12px',padding:'7px 10px',boxSizing:'border-box'}} />
                </div>))}
              </div>))}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={async()=>{if(!newSetTitle.trim())return;await axios.post('/api/sets-create',{title:newSetTitle,description:newSetDesc,questions:newSetQuestions},{headers:{authorization:token}});setCreatingSet(false);setNewSetTitle('');setNewSetDesc('');setNewSetQuestions([{question:'',answers:['','','',''],correct:0}]);axios.get('/api/sets',{headers:{authorization:token}}).then(r=>setAllSets(r.data));}} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 24px',cursor:'pointer'}}>Save Set</button>
              <button onClick={()=>setCreatingSet(false)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'rgba(255,255,255,0.5)',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 24px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>)}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {allSets.filter(s=>s.username===user.username).map(s=>(<div key={s.id} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:'700',marginBottom:'4px'}}>{s.title}</div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{s.question_count} questions</div></div><button onClick={()=>navigate('/game/solo')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'8px',color:'#a5b4fc',fontSize:'12px',fontWeight:'700',padding:'7px 14px',cursor:'pointer'}}>▶ Play</button></div>))}
            {allSets.filter(s=>s.username===user.username).length===0&&!creatingSet&&<div style={{color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>No sets yet. Create one!</div>}
          </div>
        </div>)}

        {page==='discover'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'8px',fontFamily:"'Titan One',sans-serif"}}>Discover</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Browse sets from the community</p>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {allSets.map(s=>(<div key={s.id} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontWeight:'700',marginBottom:'4px'}}>{s.title}</div><div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',marginBottom:'2px'}}>{s.question_count} questions</div><div style={{fontSize:'11px',color:'rgba(99,102,241,0.6)'}}>by {s.username}</div></div><button onClick={()=>navigate('/game/solo')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'8px',color:'#a5b4fc',fontSize:'12px',fontWeight:'700',padding:'7px 14px',cursor:'pointer'}}>▶ Play</button></div>))}
            {allSets.length===0&&<div style={{color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>No sets yet.</div>}
          </div>
        </div>)}

        {page==='chat'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'900',marginBottom:'4px',fontFamily:"'Titan One',sans-serif"}}>Chat</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'24px'}}>Talk with the Lacket community</p>
          <div style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'20px',padding:'48px',textAlign:'center',maxWidth:'500px'}}>
            <div style={{fontSize:'72px',marginBottom:'16px',filter:'drop-shadow(0 0 20px rgba(99,102,241,0.5))'}}>💬</div>
            <div style={{fontSize:'20px',fontWeight:'800',marginBottom:'8px',color:'#e0e7ff'}}>Global Chat</div>
            <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',marginBottom:'24px',lineHeight:'1.6'}}>Chat with all Lacket players in real time. Share tips, make friends, and talk about your best blooks!</div>
            <button onClick={()=>navigate('/chat')} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',fontWeight:'700',padding:'13px 32px',cursor:'pointer',boxShadow:'0 4px 20px rgba(99,102,241,0.4)'}}>Open Chat →</button>
          </div>
        </div>)}

        {page==='friends'&&(<div>
          <h1 style={{fontSize:'26px',fontWeight:'800',marginBottom:'8px',fontFamily:"'Titan One',sans-serif"}}>Friends</h1>
          <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Manage your friends</p>
          <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
            <input value={friendInput} onChange={e=>setFriendInput(e.target.value)} placeholder="Add friend by username..." onKeyDown={e=>e.key==='Enter'&&(async()=>{if(!friendInput.trim())return;try{await axios.post('/api/friends-request',{username:friendInput},{headers:{authorization:localStorage.getItem('token')}});setFriendInput('');}catch(err){alert(err?.response?.data?.error||'Error');}axios.get('/api/friends',{headers:{authorization:localStorage.getItem('token')}}).then(r=>setFriends(r.data));})()}style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',padding:'10px 14px'}} />
            <button onClick={async()=>{if(!friendInput.trim())return;try{await axios.post('/api/friends-request',{username:friendInput},{headers:{authorization:localStorage.getItem('token')}});setFriendInput('');}catch(err){alert(err?.response?.data?.error||'Error');}axios.get('/api/friends',{headers:{authorization:localStorage.getItem('token')}}).then(r=>setFriends(r.data));}} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 20px',cursor:'pointer'}}>Add</button>
          </div>
          {friends.filter&&friends.filter(f=>f.status==='pending'&&f.requester_id!==user.id).length>0&&(<div style={{marginBottom:'16px'}}><div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontWeight:'700',letterSpacing:'0.8px',marginBottom:'8px'}}>Pending Requests</div>{friends.filter(f=>f.status==='pending'&&f.requester_id!==user.id).map(f=>(<div key={f.id} style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'10px',padding:'12px 14px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'10px'}}><img src={`/content/blooks/${f.equipped_blook}`} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'36px',height:'36px',borderRadius:'8px',objectFit:'contain'}} /><div style={{flex:1,fontWeight:'700'}}>{f.username}</div><button onClick={async()=>{await axios.post('/api/friends-action',{friendId:f.user_id,action:'accept'},{headers:{authorization:localStorage.getItem('token')}});axios.get('/api/friends',{headers:{authorization:localStorage.getItem('token')}}).then(r=>setFriends(r.data));}} style={{background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'6px',color:'#22c55e',fontSize:'12px',padding:'5px 12px',cursor:'pointer'}}>Accept</button><button onClick={async()=>{await axios.post('/api/friends-action',{friendId:f.user_id,action:'decline'},{headers:{authorization:localStorage.getItem('token')}});axios.get('/api/friends',{headers:{authorization:localStorage.getItem('token')}}).then(r=>setFriends(r.data));}} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',color:'#f87171',fontSize:'12px',padding:'5px 12px',cursor:'pointer'}}>Decline</button></div>))}</div>)}
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',fontWeight:'700',letterSpacing:'0.8px',marginBottom:'8px'}}>Friends ({friends.filter(f=>f.status==='accepted').length})</div>
          {friends.filter&&friends.filter(f=>f.status==='accepted').map(f=>(<div key={f.id} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',padding:'12px 14px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'10px'}}><img src={`/content/blooks/${f.equipped_blook}`} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'36px',height:'36px',borderRadius:'8px',objectFit:'contain'}} /><div style={{flex:1}}><div style={{fontWeight:'700'}}>{f.username}</div></div><button onClick={()=>navigate(`/u/${f.username}`)} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',color:'#a5b4fc',fontSize:'12px',padding:'5px 12px',cursor:'pointer',marginRight:'6px'}}>Profile</button><button onClick={async()=>{await axios.post('/api/friends-action',{friendId:f.id,action:'remove'},{headers:{authorization:localStorage.getItem('token')}});axios.get('/api/friends',{headers:{authorization:localStorage.getItem('token')}}).then(r=>setFriends(r.data));}} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'6px',color:'#f87171',fontSize:'12px',padding:'5px 12px',cursor:'pointer'}}>Remove</button></div>))}
          {friends.length===0&&<div style={{color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>No friends yet. Add some!</div>}
        </div>)}

        {page==='devpanel'&&user?.role==='Dev'&&(<DevPanel user={user} />)}
      </div>
    </div>
  );
}
