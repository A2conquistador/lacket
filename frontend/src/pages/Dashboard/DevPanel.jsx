import { useState, useEffect } from 'react';
import axios from 'axios';

const ROLES = ['Player','VIP','Moderator','Admin','Dev'];
const ROLE_COLORS = { Player:'#9ca3af', VIP:'#f59e0b', Moderator:'#22c55e', Admin:'#3b82f6', Dev:'#ec4899' };

export default function DevPanel({ user }) {
    const [users, setUsers] = useState([]);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [tokenUser, setTokenUser] = useState('');
    const [tokenAmount, setTokenAmount] = useState('');
    const [blookUser, setBlookUser] = useState('');
    const [blookName, setBlookName] = useState('');
    const [blookRarity, setBlookRarity] = useState('Common');
    const token = localStorage.getItem('token');
    const h = { authorization: token };

    const load = () => axios.get('/api/admin/users', { headers: h }).then(r => setUsers(r.data)).catch(() => {});
    useEffect(() => { load(); }, []);

    const flash = (m, e) => { if(e) setErr(m); else setMsg(m); setTimeout(() => { setMsg(''); setErr(''); }, 3000); };

    const giveTokens = async () => {
        try { await axios.post('/api/admin/tokens', { username: tokenUser, amount: parseInt(tokenAmount) }, { headers: h }); flash('Tokens given!'); load(); setTokenUser(''); setTokenAmount(''); }
        catch(e) { flash(e.response?.data?.error || 'Failed', true); }
    };

    const giveBlook = async () => {
        try { await axios.post('/api/admin/blook', { username: blookUser, blook_name: blookName, rarity: blookRarity }, { headers: h }); flash('Blook given!'); setBlookUser(''); setBlookName(''); }
        catch(e) { flash(e.response?.data?.error || 'Failed', true); }
    };

    const toggleBan = async (username, banned) => {
        try { await axios.post('/api/admin/ban', { username, banned: !banned }, { headers: h }); flash((banned?'Un':'')+'banned '+username); load(); }
        catch(e) { flash(e.response?.data?.error || 'Failed', true); }
    };

    const setRole = async (username, role) => {
        try { await axios.post('/api/admin/role', { username, role }, { headers: h }); flash('Role updated!'); load(); }
        catch(e) { flash(e.response?.data?.error || 'Failed', true); }
    };

    const S = {
        card: { background:'linear-gradient(135deg,#0d1240,#0a0f2e)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'16px', padding:'24px', marginBottom:'20px' },
        label: { fontSize:'13px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px', fontWeight:'700' },
        input: { background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'8px', color:'#fff', fontFamily:'Nunito,sans-serif', fontSize:'14px', padding:'9px 12px', marginRight:'8px', marginBottom:'8px' },
        btn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'8px', color:'#fff', fontFamily:'Nunito,sans-serif', fontSize:'14px', fontWeight:'700', padding:'9px 18px', cursor:'pointer' },
    };

    return (
        <div style={{maxWidth:'900px'}}>
            <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'32px',margin:'0 0 4px',color:'#ec4899'}}>🛠️ Dev Panel</h1>
            <p style={{margin:'0 0 28px',color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Server administration tools</p>

            {msg && <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'10px',padding:'12px 16px',color:'#86efac',marginBottom:'16px'}}>{msg}</div>}
            {err && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'12px 16px',color:'#f87171',marginBottom:'16px'}}>{err}</div>}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
                <div style={S.card}>
                    <div style={S.label}>Give Tokens</div>
                    <input style={S.input} placeholder="Username" value={tokenUser} onChange={e=>setTokenUser(e.target.value)} />
                    <input style={{...S.input,width:'100px'}} placeholder="Amount" type="number" value={tokenAmount} onChange={e=>setTokenAmount(e.target.value)} />
                    <button style={S.btn} onClick={giveTokens}>Give</button>
                </div>
                <div style={S.card}>
                    <div style={S.label}>Give Blook</div>
                    <input style={S.input} placeholder="Username" value={blookUser} onChange={e=>setBlookUser(e.target.value)} />
                    <input style={S.input} placeholder="Blook name" value={blookName} onChange={e=>setBlookName(e.target.value)} />
                    <select value={blookRarity} onChange={e=>setBlookRarity(e.target.value)} style={{...S.input,marginRight:'8px'}}>
                        {['Common','Uncommon','Rare','Epic','Legendary','Dev'].map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                    <button style={S.btn} onClick={giveBlook}>Give</button>
                </div>
            </div>

            <div style={S.card}>
                <div style={S.label}>All Users ({users.length})</div>
                <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                        <thead>
                            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                                {['ID','Username','Tokens','Role','Status','Actions'].map(h=>(
                                    <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'rgba(255,255,255,0.4)',fontWeight:'700',fontSize:'12px',textTransform:'uppercase'}}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                                    <td style={{padding:'10px 12px',color:'rgba(255,255,255,0.3)'}}>{u.id}</td>
                                    <td style={{padding:'10px 12px',fontWeight:'700',color:'#e0e7ff'}}>{u.username}</td>
                                    <td style={{padding:'10px 12px',color:'#f59e0b'}}>{u.tokens?.toLocaleString()}</td>
                                    <td style={{padding:'10px 12px'}}>
                                        <select value={u.role||'Player'} onChange={e=>setRole(u.username,e.target.value)} style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',color:ROLE_COLORS[u.role]||'#9ca3af',fontSize:'12px',padding:'4px 8px',cursor:'pointer'}}>
                                            {ROLES.map(r=><option key={r} value={r} style={{color:'#fff',background:'#0d1240'}}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td style={{padding:'10px 12px'}}>
                                        <span style={{background:u.banned?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',border:'1px solid '+(u.banned?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'),borderRadius:'6px',padding:'3px 8px',fontSize:'12px',color:u.banned?'#f87171':'#86efac'}}>{u.banned?'Banned':'Active'}</span>
                                    </td>
                                    <td style={{padding:'10px 12px'}}>
                                        {u.username !== user.username && <button onClick={()=>toggleBan(u.username,u.banned)} style={{background:u.banned?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:'1px solid '+(u.banned?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'),borderRadius:'6px',color:u.banned?'#86efac':'#f87171',fontSize:'12px',fontWeight:'700',padding:'4px 10px',cursor:'pointer'}}>{u.banned?'Unban':'Ban'}</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
