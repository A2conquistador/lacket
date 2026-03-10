import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MODES = [
    { id: 'solo', name: 'Solo Play', emoji: '🧠', color1: '#6366f1', color2: '#8b5cf6', desc: 'Play trivia games with your question sets. Challenge yourself!', players: '1', status: 'available' },
    { id: 'classic', name: 'Classic', emoji: '🎮', color1: '#6366f1', color2: '#8b5cf6', desc: 'Answer questions before time runs out. Speed = more points!', players: '1-10', status: 'available' },
    { id: 'goldquest', name: 'Gold Quest', emoji: '🏆', color1: '#f59e0b', color2: '#d97706', desc: 'Race to collect the most gold by answering correctly.', players: '1-10', status: 'available' },
    { id: 'towerdefense', name: 'Tower Defense', emoji: '🏰', color1: '#ef4444', color2: '#dc2626', desc: 'Defend your tower by answering questions to attack enemies.', players: '1-10', status: 'available' },
    { id: 'battleroyale', name: 'Battle Royale', emoji: '⚔️', color1: '#ec4899', color2: '#db2777', desc: 'Last blook standing wins. Wrong answers cost you lives!', players: '2-10', status: 'available' },
    { id: 'factory', name: 'Factory', emoji: '🏭', color1: '#22c55e', color2: '#16a34a', desc: 'Run your factory by answering questions to produce goods.', players: '1-10', status: 'available' },
    { id: 'cafe', name: 'Café', emoji: '☕', color1: '#a78bfa', color2: '#7c3aed', desc: 'Serve customers by answering correctly in your café.', players: '1-10', status: 'available' },
];

export default function Play() {
    const navigate = useNavigate();
    const [view, setView] = useState('modes'); // modes, selectSet
    const [selectedMode, setSelectedMode] = useState(null);
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    const handleModeClick = (mode) => {
        setSelectedMode(mode);
        setView('selectSet');
        loadSets();
    };

    const loadSets = () => {
        setLoading(true);
        axios.get('/api/sets', { headers: { authorization: token } })
            .then(res => {
                setSets(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                alert('Failed to load question sets');
                setLoading(false);
            });
    };

    const playMode = (setId) => {
        const modeRoutes = {
            'solo': `/game/solo?set=${setId}`,
            'classic': `/game/classic?set=${setId}`,
            'goldquest': `/game/goldquest?set=${setId}`,
            'towerdefense': `/game/towerdefense?set=${setId}`,
            'battleroyale': `/game/battleroyale?set=${setId}`,
            'factory': `/game/factory?set=${setId}`,
            'cafe': `/game/cafe?set=${setId}`,
        };
        navigate(modeRoutes[selectedMode.id]);
    };

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif'}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px',borderBottom:'1px solid rgba(99,102,241,0.15)'}}>
                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',cursor:'pointer'}} onClick={() => navigate('/dashboard')}>Lacket</div>
                <button onClick={() => navigate('/dashboard')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'8px 20px',cursor:'pointer'}}>← Dashboard</button>
            </div>

            <div style={{maxWidth:'1100px',margin:'0 auto',padding:'40px 40px'}}>
                {view === 'modes' ? (
                    <div>
                        <div style={{textAlign:'center',marginBottom:'48px'}}>
                            <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'48px',margin:'0 0 12px',background:'linear-gradient(135deg,#818cf8,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Game Modes</h1>
                            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'16px',margin:0}}>Choose how you want to play</p>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'20px'}}>
                            {MODES.map(mode => (
                                <div key={mode.id} onClick={() => handleModeClick(mode)} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'2px solid rgba(99,102,241,0.15)',borderRadius:'20px',padding:'28px',cursor:'pointer',opacity:1,transition:'all 0.2s',position:'relative',overflow:'hidden'}}>
                                    <div style={{fontSize:'52px',marginBottom:'16px'}}>{mode.emoji}</div>
                                    <div style={{fontFamily:'Titan One,sans-serif',fontSize:'22px',color:'#e0e7ff',marginBottom:'8px'}}>{mode.name}</div>
                                    <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',marginBottom:'16px',lineHeight:'1.5'}}>{mode.desc}</div>
                                    <div style={{display:'flex',gap:'8px'}}>
                                        <span style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',color:'#a5b4fc'}}>👥 {mode.players}</span>
                                        <span style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',color:'#86efac'}}>✓ Available</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => setView('modes')} style={{marginBottom:'32px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontFamily:'Nunito,sans-serif',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
                        
                        <h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'32px',marginBottom:'8px',color:'#e0e7ff'}}>Select a Question Set</h2>
                        <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'24px'}}>Choose a set to play {selectedMode.name}</p>

                        {loading ? (
                            <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.4)'}}>Loading question sets...</div>
                        ) : sets.length === 0 ? (
                            <div style={{textAlign:'center',padding:'60px 20px',background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'16px'}}>
                                <div style={{fontSize:'48px',marginBottom:'16px'}}>📚</div>
                                <h3 style={{fontSize:'20px',color:'#e0e7ff',marginBottom:'8px'}}>No Question Sets Found</h3>
                                <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>Create a question set first on the Dashboard</p>
                                <button onClick={() => navigate('/dashboard')} style={{padding:'10px 24px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Go to Dashboard</button>
                            </div>
                        ) : (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
                                {sets.map(set => (
                                    <div key={set.id} onClick={() => playMode(set.id)} style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'14px',padding:'20px',cursor:'pointer',transition:'all 0.2s'}}>
                                        <h3 style={{fontSize:'16px',fontWeight:'800',color:'#e0e7ff',marginBottom:'6px'}}>{set.title}</h3>
                                        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',marginBottom:'12px'}}>{set.description}</p>
                                        <div style={{display:'flex',gap:'8px',alignItems:'center',fontSize:'12px',color:'rgba(255,255,255,0.3)'}}>
                                            <span>📝 {set.question_count} questions</span>
                                            <span>👤 by {set.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
