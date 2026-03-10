import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ROLE_COLORS = { Player:'#9ca3af', VIP:'#f59e0b', Moderator:'#22c55e', Admin:'#3b82f6', Dev:'#ec4899' };
const ROLE_BADGES = { VIP:'⭐', Moderator:'🛡️', Admin:'👑', Dev:'🛠️' };
const MOD_ROLES = ['Dev','Admin','Moderator'];

export default function Chat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [user, setUser] = useState(null);
    const [announce, setAnnounce] = useState('');
    const [connected, setConnected] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const ws = useRef(null);
    const bottom = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        axios.get('/api/users/me', { headers: { authorization: token } }).then(r => setUser(r.data)).catch(() => navigate('/login'));
        const wsUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/chat';
        ws.current = new WebSocket(wsUrl);
        ws.current.onopen = () => setConnected(true);
        ws.current.onclose = () => setConnected(false);
        ws.current.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'history') setMessages(msg.messages);
            else if (msg.type === 'message' || msg.type === 'announce') setMessages(prev => [...prev, { ...msg.message, isAnnounce: msg.type === 'announce' }]);
        };
        return () => ws.current?.close();
    }, []);

    useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = () => {
        const token = localStorage.getItem('token');
        if (!input.trim() || !ws.current) return;
        ws.current.send(JSON.stringify({ type: 'send', token, content: input.trim() }));
        setInput('');
    };

    const sendAnnounce = () => {
        const token = localStorage.getItem('token');
        if (!announce.trim() || !ws.current) return;
        ws.current.send(JSON.stringify({ type: 'announce', token, content: announce.trim() }));
        setAnnounce('');
    };

    const deleteMessage = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('/api/admin/delete-message', { id }, { headers: { authorization: token } });
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch(e) { alert(e.response?.data?.error || 'Failed to delete'); }
    };

    const startEdit = (m) => { setEditingId(m.id); setEditText(m.content); };

    const saveEdit = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('/api/users/edit-message', { id, content: editText }, { headers: { authorization: token } });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, content: res.data.content, edited: true } : m));
            setEditingId(null);
        } catch(e) { alert(e.response?.data?.error || 'Failed to edit'); }
    };

    const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const canModify = (m) => user && (m.user_id === user.id || MOD_ROLES.includes(user.role));

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',borderBottom:'1px solid rgba(99,102,241,0.15)',flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                    <div style={{fontFamily:'Titan One,sans-serif',fontSize:'24px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',cursor:'pointer'}} onClick={() => navigate('/dashboard')}>Lacket</div>
                    <div style={{fontSize:'20px',fontWeight:'800',color:'#e0e7ff'}}>💬 Global Chat</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:connected?'#22c55e':'#ef4444'}}>
                        <div style={{width:'8px',height:'8px',borderRadius:'50%',background:connected?'#22c55e':'#ef4444'}} />
                        {connected ? 'Connected' : 'Disconnected'}
                    </div>
                    <button onClick={() => navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'8px 18px',cursor:'pointer'}}>← Back</button>
                </div>
            </div>

            <div style={{flex:1,display:'flex',flexDirection:'column',maxWidth:'800px',width:'100%',margin:'0 auto',padding:'0 24px 24px'}}>
                {user?.role && ['Dev','Admin'].includes(user.role) && (
                    <div style={{margin:'16px 0',background:'rgba(236,72,153,0.08)',border:'1px solid rgba(236,72,153,0.2)',borderRadius:'12px',padding:'12px 16px',display:'flex',gap:'8px'}}>
                        <input value={announce} onChange={e=>setAnnounce(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAnnounce()} placeholder="📢 Send announcement..." style={{flex:1,background:'transparent',border:'none',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',outline:'none'}} />
                        <button onClick={sendAnnounce} style={{background:'rgba(236,72,153,0.2)',border:'1px solid rgba(236,72,153,0.3)',borderRadius:'8px',color:'#f0abfc',fontFamily:'Nunito,sans-serif',fontSize:'13px',fontWeight:'700',padding:'6px 14px',cursor:'pointer'}}>Announce</button>
                    </div>
                )}

                <div style={{flex:1,overflowY:'auto',padding:'16px 0',display:'flex',flexDirection:'column',gap:'2px',minHeight:'400px',maxHeight:'calc(100vh - 260px)'}}>
                    {messages.map((m, i) => m.isAnnounce ? (
                        <div key={i} style={{background:'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(168,85,247,0.08))',border:'1px solid rgba(236,72,153,0.3)',borderRadius:'12px',padding:'12px 16px',margin:'8px 0'}}>
                            <div style={{fontSize:'12px',color:'#f0abfc',fontWeight:'700',marginBottom:'4px'}}>📢 ANNOUNCEMENT from {m.username}</div>
                            <div style={{fontSize:'15px',color:'#e0e7ff'}}>{m.content}</div>
                        </div>
                    ) : (
                        <div key={i} style={{display:'flex',gap:'10px',padding:'6px 8px',borderRadius:'8px',background:m.username===user?.username?'rgba(99,102,241,0.05)':'transparent',alignItems:'flex-start',group:'true'}}>
                            <div style={{flexShrink:0,width:'32px',height:'32px',background:'rgba(99,102,241,0.15)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>
                                {ROLE_BADGES[m.role] || '👤'}
                            </div>
                            <div style={{flex:1}}>
                                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'2px'}}>
                                    <span style={{fontSize:'14px',fontWeight:'800',color:ROLE_COLORS[m.role]||'#9ca3af'}}>{m.username}</span>
                                    {m.role && m.role !== 'Player' && <span style={{fontSize:'10px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'4px',padding:'1px 6px',color:ROLE_COLORS[m.role],textTransform:'uppercase',letterSpacing:'0.5px'}}>{m.role}</span>}
                                    <span style={{fontSize:'11px',color:'rgba(255,255,255,0.2)'}}>{formatTime(m.created_at)}</span>
                                    {m.edited && <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)'}}>(edited)</span>}
                                </div>
                                {editingId === m.id ? (
                                    <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                                        <input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveEdit(m.id)} style={{flex:1,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'8px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'14px',padding:'6px 10px',outline:'none'}} />
                                        <button onClick={()=>saveEdit(m.id)} style={{background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'6px',color:'#86efac',fontSize:'12px',padding:'4px 10px',cursor:'pointer'}}>Save</button>
                                        <button onClick={()=>setEditingId(null)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',color:'rgba(255,255,255,0.4)',fontSize:'12px',padding:'4px 10px',cursor:'pointer'}}>Cancel</button>
                                    </div>
                                ) : (
                                    <div style={{fontSize:'15px',color:'#e0e7ff',lineHeight:'1.4'}}>{m.content}</div>
                                )}
                            </div>
                            {canModify(m) && editingId !== m.id && (
                                <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                                    {m.user_id === user?.id && <button onClick={()=>startEdit(m)} style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',color:'#a5b4fc',fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}>✏️</button>}
                                    <button onClick={()=>deleteMessage(m.id)} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'6px',color:'#f87171',fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}>🗑️</button>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={bottom} />
                </div>

                <div style={{display:'flex',gap:'10px',paddingTop:'16px',borderTop:'1px solid rgba(99,102,241,0.1)'}}>
                    <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Send a message..." maxLength={300} style={{flex:1,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',padding:'12px 16px',outline:'none'}} />
                    <button onClick={send} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'12px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'15px',fontWeight:'700',padding:'12px 24px',cursor:'pointer'}}>Send</button>
                </div>
            </div>
        </div>
    );
}
