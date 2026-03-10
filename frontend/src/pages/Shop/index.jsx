import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SHOP_ITEMS = [
    { id: 'glow_blue', name: 'Blue Glow', desc: 'Make your blooks glow blue', price: 100, emoji: '🔵', type: 'cosmetic', category: 'Glows' },
    { id: 'glow_purple', name: 'Purple Glow', desc: 'Make your blooks glow purple', price: 100, emoji: '🟣', type: 'cosmetic', category: 'Glows' },
    { id: 'glow_gold', name: 'Golden Glow', desc: 'Make your blooks glow gold', price: 200, emoji: '🟡', type: 'cosmetic', category: 'Glows' },
    { id: 'name_color_red', name: 'Red Name Color', desc: 'Your username appears in red', price: 50, emoji: '🔴', type: 'cosmetic', category: 'Names' },
    { id: 'name_color_gold', name: 'Gold Name Color', desc: 'Your username appears in gold', price: 150, emoji: '✨', type: 'cosmetic', category: 'Names' },
    { id: 'name_color_rainbow', name: 'Rainbow Name', desc: 'Your username cycles through colors', price: 300, emoji: '🌈', type: 'cosmetic', category: 'Names' },
    { id: 'badge_trophy', name: 'Trophy Badge', desc: 'Display a trophy badge', price: 75, emoji: '🏆', type: 'badge', category: 'Badges' },
    { id: 'badge_crown', name: 'Crown Badge', desc: 'Display a crown badge', price: 100, emoji: '👑', type: 'badge', category: 'Badges' },
    { id: 'badge_star', name: 'Star Badge', desc: 'Display a star badge', price: 125, emoji: '⭐', type: 'badge', category: 'Badges' },
    { id: 'title_legend', name: '"Legend" Title', desc: 'Show "Legend" under your name', price: 200, emoji: '🗡️', type: 'title', category: 'Titles' },
    { id: 'title_master', name: '"Master" Title', desc: 'Show "Master" under your name', price: 150, emoji: '🎯', type: 'title', category: 'Titles' },
    { id: 'title_elite', name: '"Elite" Title', desc: 'Show "Elite" under your name', price: 100, emoji: '💎', type: 'title', category: 'Titles' },
    { id: 'profile_border_gold', name: 'Gold Profile Border', desc: 'Gold border on your profile', price: 100, emoji: '🟨', type: 'cosmetic', category: 'Borders' },
    { id: 'profile_border_diamond', name: 'Diamond Border', desc: 'Diamond pattern profile border', price: 250, emoji: '💠', type: 'cosmetic', category: 'Borders' },
];

export default function Shop() {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState(0);
    const [owned, setOwned] = useState([]);
    const [filter, setFilter] = useState('all');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = await axios.get('/api/users/me', { headers: { authorization: token } });
            setTokens(user.data.tokens);
            setLoading(false);
        } catch (err) {
            navigate('/login');
        }
    };

    const buyItem = async (item) => {
        if (tokens < item.price) {
            setMessage('Not enough tokens!');
            return;
        }
        if (owned.includes(item.id)) {
            setMessage('Already owned!');
            return;
        }

        try {
            const res = await axios.post('/api/shop', { item_id: item.id }, { headers: { authorization: token } });
            setTokens(res.data.tokens);
            setOwned([...owned, item.id]);
            setMessage(`Purchased ${item.name}! 🎉`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Purchase failed');
        }
    };

    const categories = ['all', 'Glows', 'Names', 'Badges', 'Titles', 'Borders'];
    const filtered = filter === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === filter);

    if (loading) return <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',padding:'40px'}}>
            <style>{`
                @keyframes shimmer { 0%,100%{background-position:0} 50%{background-position:100%} }
                .shop-item:hover { transform: translateY(-4px); border-color: rgba(99,102,241,0.5) !important; }
                .owned-badge { position: absolute; top: 8px; right: 8px; background: rgba(34,197,94,0.9); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
            `}</style>

            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'40px',maxWidth:'1200px',margin:'0 auto 40px'}}>
                <div>
                    <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'36px',margin:'0 0 4px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Token Shop</h1>
                    <p style={{margin:0,color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Purchase cosmetics with tokens</p>
                </div>
                <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                    <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'12px',padding:'10px 20px',fontSize:'20px',fontWeight:'800',color:'#f59e0b'}}>🪙 {tokens.toLocaleString()}</div>
                    <button onClick={() => navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'10px 20px',cursor:'pointer'}}>← Dashboard</button>
                </div>
            </div>

            {message && <div style={{maxWidth:'1200px',margin:'0 auto 20px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.4)',borderRadius:'12px',padding:'12px 20px',color:'#86efac',textAlign:'center'}}>{message}</div>}

            {/* Filter buttons */}
            <div style={{display:'flex',gap:'8px',marginBottom:'32px',maxWidth:'1200px',margin:'0 auto',overflowX:'auto',paddingBottom:'8px'}}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            padding: '8px 16px',
                            background: filter === cat ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)',
                            border: `1px solid ${filter === cat ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
                            borderRadius: '10px',
                            color: '#fff',
                            fontFamily: 'Nunito,sans-serif',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat === 'all' ? 'All Items' : cat}
                    </button>
                ))}
            </div>

            {/* Items grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'20px',maxWidth:'1200px',margin:'0 auto'}}>
                {filtered.map(item => (
                    <div key={item.id} className="shop-item" style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'16px',padding:'20px',transition:'all 0.25s',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                        {owned.includes(item.id) && <div className="owned-badge">✓</div>}
                        
                        <div style={{fontSize:'56px',marginBottom:'12px',textAlign:'center'}}>{item.emoji}</div>
                        
                        <h3 style={{fontFamily:'Titan One,sans-serif',fontSize:'18px',color:'#e0e7ff',margin:'0 0 6px',textAlign:'center'}}>{item.name}</h3>
                        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',margin:'0 0 16px',textAlign:'center',lineHeight:'1.4'}}>{item.desc}</p>
                        
                        <div style={{display:'flex',gap:'8px',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
                            <span style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',color:'#a5b4fc',fontWeight:'700',textTransform:'uppercase'}}>{item.type}</span>
                        </div>

                        <button
                            onClick={() => buyItem(item)}
                            disabled={owned.includes(item.id) || tokens < item.price}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: owned.includes(item.id) ? 'rgba(34,197,94,0.1)' : tokens >= item.price ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                                border: owned.includes(item.id) ? '1px solid rgba(34,197,94,0.3)' : `1px solid ${tokens >= item.price ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
                                borderRadius: '10px',
                                color: owned.includes(item.id) ? '#86efac' : tokens >= item.price ? '#fff' : 'rgba(255,255,255,0.3)',
                                fontFamily: 'Nunito,sans-serif',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: owned.includes(item.id) || tokens < item.price ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {owned.includes(item.id) ? '✓ Owned' : `🪙 ${item.price}`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
