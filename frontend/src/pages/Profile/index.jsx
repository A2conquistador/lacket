import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RARITY_COLORS = { Common:'#9ca3af', Uncommon:'#22c55e', Rare:'#3b9eff', Epic:'#a855f7', Legendary:'#f59e0b', Mythic:'#ef4444', Chroma:'#ec4899', Dev:'#282C34' };

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('blooks');

  useEffect(() => {
    axios.get('/api/users/profile?username='+username)
      .then(res => setProfile(res.data))
      .catch(() => setError('User not found.'));
  }, [username]);

  const S = {
    page: { minHeight:'100vh', background:'#05071a', color:'#fff', fontFamily:'sans-serif', padding:'40px 20px' },
    card: { background:'linear-gradient(135deg,#0d1240,#0a0f2e)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'16px', padding:'24px' },
  };

  if (error) return (
    <div style={S.page}>
      <div style={{textAlign:'center',paddingTop:'100px'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>😕</div>
        <div style={{fontSize:'24px',fontWeight:'800',color:'#e0e7ff',marginBottom:'8px'}}>User not found</div>
        <button onClick={()=>navigate('/dashboard')} style={{background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',color:'#a5b4fc',fontSize:'14px',fontWeight:'600',padding:'10px 24px',cursor:'pointer',marginTop:'16px'}}>Back to Dashboard</button>
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{...S.page,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:'16px'}}>Loading...</div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontSize:'14px',fontWeight:'700',padding:'8px 20px',cursor:'pointer',marginBottom:'28px'}}>← Dashboard</button>

        <div style={{...S.card,display:'flex',alignItems:'center',gap:'24px',marginBottom:'20px'}}>
          <img src={'/content/blooks/'+(profile.equipped_blook||'Default.png')} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'90px',height:'90px',borderRadius:'16px',border:'2px solid rgba(99,102,241,0.3)'}} />
          <div style={{flex:1}}>
            <div style={{fontFamily:'Titan One,sans-serif',fontSize:'32px',color:'#e0e7ff',marginBottom:'4px'}}>{profile.username}</div>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',marginBottom:'12px'}}>Joined {new Date(profile.created_at).toLocaleDateString()}</div>
            <div style={{display:'flex',gap:'16px'}}>
              <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
                <div style={{fontSize:'20px',fontWeight:'800',color:'#f59e0b'}}>{profile.tokens?.toLocaleString()}</div>
                <div style={{fontSize:'11px',color:'rgba(245,158,11,0.5)',textTransform:'uppercase'}}>Tokens</div>
              </div>
              <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
                <div style={{fontSize:'20px',fontWeight:'800',color:'#a5b4fc'}}>{profile.blook_count||0}</div>
                <div style={{fontSize:'11px',color:'rgba(99,102,241,0.5)',textTransform:'uppercase'}}>Blooks</div>
              </div>
              <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'10px',padding:'10px 18px',textAlign:'center'}}>
                <div style={{fontSize:'20px',fontWeight:'800',color:'#a5b4fc'}}>{profile.blooks?.filter(b=>['Legendary','Mythic','Chroma'].includes(b.rarity)).length||0}</div>
                <div style={{fontSize:'11px',color:'rgba(99,102,241,0.5)',textTransform:'uppercase'}}>Rare+</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {['blooks','showcase'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?'rgba(99,102,241,0.2)':'rgba(99,102,241,0.05)',border:`1px solid ${tab===t?'rgba(99,102,241,0.4)':'rgba(99,102,241,0.1)'}`,borderRadius:'8px',color:tab===t?'#a5b4fc':'rgba(255,255,255,0.3)',fontSize:'13px',fontWeight:'700',padding:'8px 20px',cursor:'pointer',textTransform:'capitalize'}}>
              {t}
            </button>
          ))}
        </div>

        {tab==='blooks' && (
          <div style={S.card}>
            {(!profile.blooks||profile.blooks.length===0) && <div style={{color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>No blooks yet.</div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'10px'}}>
              {profile.blooks?.map((b,i)=>(
                <div key={i} style={{background:'rgba(99,102,241,0.06)',border:`1px solid ${RARITY_COLORS[b.rarity]||'rgba(99,102,241,0.15)'}33`,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                  <img src={'/content/blooks/'+b.blook_name} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'60px',height:'60px',objectFit:'contain',marginBottom:'6px'}} />
                  <div style={{fontSize:'12px',fontWeight:'700',color:'#e0e7ff',marginBottom:'2px'}}>{b.blook_name.replace(/\.(png|gif)/g,'')}</div>
                  <div style={{fontSize:'11px',fontWeight:'700',color:RARITY_COLORS[b.rarity]||'#9ca3af'}}>{b.rarity}</div>
                  {b.count>1 && <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)'}}>x{b.count}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='showcase' && (
          <div style={S.card}>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.3)',marginBottom:'16px'}}>Top 10 rarest blooks</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'12px'}}>
              {profile.blooks?.slice(0,10).map((b,i)=>(
                <div key={i} style={{background:`linear-gradient(135deg,${RARITY_COLORS[b.rarity]||'#6366f1'}15,transparent)`,border:`1px solid ${RARITY_COLORS[b.rarity]||'rgba(99,102,241,0.2)'}44`,borderRadius:'14px',padding:'16px',textAlign:'center'}}>
                  <img src={'/content/blooks/'+b.blook_name} onError={e=>e.target.src='/content/blooks/Default.png'} style={{width:'70px',height:'70px',objectFit:'contain',marginBottom:'8px'}} />
                  <div style={{fontSize:'13px',fontWeight:'700',color:'#e0e7ff',marginBottom:'3px'}}>{b.blook_name.replace(/\.(png|gif)/g,'')}</div>
                  <div style={{fontSize:'12px',fontWeight:'700',color:RARITY_COLORS[b.rarity]||'#9ca3af'}}>{b.rarity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
