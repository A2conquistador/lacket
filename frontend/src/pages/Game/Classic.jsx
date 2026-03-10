import { useState, useEffect, useRef } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate } from 'react-router-dom';
import { useGameQuestions } from './useGameQuestions';

const COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const SHAPES = ['▲','◆','●','■'];

export default function Classic() {
    const navigate = useNavigate();
    const { questions, loading, error } = useGameQuestions();
    const [phase, setPhase] = useState('lobby'); // lobby | question | result | gameover
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(null);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [history, setHistory] = useState([]);
    const startTime = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => () => clearInterval(timerRef.current), []);

    const startGame = () => { sounds.click();
        setPhase('question');
        setCurrentQ(0);
        setScore(0);
        setStreak(0);
        setHistory([]);
        beginQuestion();
    };

    const beginQuestion = () => {
        setSelected(null);
        setCorrect(null);
        setTimeLeft(20);
        startTime.current = Date.now();
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
                return t - 1;
            });
        }, 1000);
    };

    const handleTimeout = () => {
        sounds.timeUp();
        setCorrect(questions[currentQ].correct);
        setSelected(-1);
        setStreak(0);
        setPointsEarned(0);
        setPhase('result');
        setTimeout(() => advance(), 2200);
    };

    const handleAnswer = (idx) => {
        if (selected !== null) return;
        clearInterval(timerRef.current);
        const q = questions[currentQ];
        const elapsed = (Date.now() - startTime.current) / 1000;
        const isRight = idx === q.correct;
        if (isRight) sounds.correct(); else sounds.wrong();
        setSelected(idx);
        setCorrect(q.correct);
        let pts = 0;
        if (isRight) {
            // Points: up to 1000, speed bonus, streak bonus
            const speedBonus = Math.max(0, Math.floor((20 - elapsed) / 20 * 600));
            const streakBonus = streak >= 3 ? 100 : streak >= 2 ? 50 : 0;
            pts = 400 + speedBonus + streakBonus;
            setScore(s => s + pts);
            setStreak(s => { if(s+1 >= 3) sounds.streak(); return s+1; });
        } else {
            setStreak(0);
        }
        setPointsEarned(pts);
        setHistory(h => [...h, { q: q.question, correct: isRight, pts }]);
        setPhase('result');
        setTimeout(() => advance(), 2000);
    };

    const advance = () => {
        const next = currentQ + 1;
        if (next >= questions.length) { setPhase('gameover'); sounds.gameOver();; return; }
        setCurrentQ(next);
        setPhase('question');
        beginQuestion();
    };

    useEffect(() => {
        if (phase === 'question') beginQuestion();
    }, [currentQ]);

    // prevent double-call on mount
    const didMount = useRef(false);
    useEffect(() => {
        if (phase === 'question' && !didMount.current) { didMount.current = true; }
    }, []);

    if (loading) return <Loader />;
    if (error || !questions.length) return <NoQuestions navigate={navigate} />;

    if (phase === 'lobby') return (
        <Screen bg="linear-gradient(135deg,#0a0f2e,#050714)">
            <BackBtn navigate={navigate} />
            <div style={{textAlign:'center'}}>
                <div style={{fontSize:'90px',marginBottom:'16px'}}>🎮</div>
                <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'52px',color:'#818cf8',margin:'0 0 8px'}}>Classic</h1>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'16px',marginBottom:'12px'}}>{questions.length} questions • Answer fast for more points!</p>
                <div style={{display:'flex',gap:'16px',justifyContent:'center',marginBottom:'32px',flexWrap:'wrap'}}>
                    <Pill>⚡ Speed Bonus</Pill>
                    <Pill>🔥 Streak Bonus</Pill>
                    <Pill>🏆 Max 1000 pts/Q</Pill>
                </div>
                <button onClick={startGame} style={{padding:'16px 56px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'14px',color:'#fff',fontFamily:'Titan One,sans-serif',fontSize:'22px',cursor:'pointer',boxShadow:'0 4px 24px rgba(99,102,241,0.4)'}}>Play Solo</button>
            </div>
        </Screen>
    );

    if (phase === 'gameover') return (
        <Screen bg="linear-gradient(135deg,#0a0f2e,#050714)">
            <div style={{textAlign:'center',maxWidth:'500px',width:'100%'}}>
                <div style={{fontSize:'80px',marginBottom:'16px'}}>{score > questions.length * 600 ? '🏆' : '🎉'}</div>
                <h1 style={{fontFamily:'Titan One,sans-serif',fontSize:'44px',color:'#818cf8',marginBottom:'8px'}}>Game Over!</h1>
                <div style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'20px',padding:'32px',marginBottom:'24px'}}>
                    <div style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px'}}>Final Score</div>
                    <div style={{fontFamily:'Titan One,sans-serif',fontSize:'72px',background:'linear-gradient(135deg,#f59e0b,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{score.toLocaleString()}</div>
                    <div style={{color:'rgba(255,255,255,0.5)',marginTop:'8px'}}>{history.filter(h=>h.correct).length}/{questions.length} correct</div>
                </div>
                <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                    <button onClick={startGame} style={{padding:'12px 28px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'15px'}}>Play Again</button>
                    <button onClick={() => navigate('/play')} style={{padding:'12px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer',fontSize:'15px'}}>Back</button>
                </div>
            </div>
        </Screen>
    );

    const q = questions[currentQ];
    const pct = (timeLeft / 20) * 100;

    return (
        <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0f2e,#050714)',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column'}}>
            {/* Top bar */}
            <div style={{background:'rgba(0,0,0,0.4)',borderBottom:'1px solid rgba(99,102,241,0.2)',padding:'12px 24px',display:'flex',alignItems:'center',gap:'16px'}}>
                <div style={{flex:1,height:'8px',background:'rgba(255,255,255,0.1)',borderRadius:'99px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:pct+'%',background:timeLeft<=5?'#ef4444':timeLeft<=10?'#f59e0b':'#6366f1',borderRadius:'99px',transition:'width 1s linear'}} />
                </div>
                <div style={{fontFamily:'Titan One,sans-serif',fontSize:'22px',color:timeLeft<=5?'#ef4444':'#fff',minWidth:'40px',textAlign:'center'}}>{timeLeft}</div>
                <div style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'10px',padding:'6px 16px',fontWeight:'800',color:'#f59e0b',fontSize:'16px'}}>🏅 {score.toLocaleString()}</div>
                {streak >= 2 && <div style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'6px 12px',fontWeight:'800',color:'#ef4444',fontSize:'14px'}}>🔥 {streak}x</div>}
            </div>

            {/* Question */}
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',maxWidth:'860px',margin:'0 auto',width:'100%'}}>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'2px'}}>Question {currentQ+1} of {questions.length}</div>
                <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'20px',padding:'32px 40px',marginBottom:'32px',width:'100%',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'800',color:'#e0e7ff',lineHeight:'1.4'}}>{q.question}</div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',width:'100%'}}>
                    {q.answers.map((ans, idx) => {
                        let bg = COLORS[idx];
                        let opacity = 1;
                        let extra = {};
                        if (phase === 'result') {
                            if (idx === correct) { bg = '#22c55e'; extra = {boxShadow:'0 0 20px rgba(34,197,94,0.5)'}; }
                            else if (idx === selected) { bg = '#ef4444'; }
                            else { opacity = 0.35; }
                        }
                        return (
                            <button key={idx} onClick={() => handleAnswer(idx)} disabled={phase==='result'} style={{background:bg,border:'none',borderRadius:'14px',padding:'20px 24px',color:'#fff',fontFamily:'Nunito,sans-serif',fontSize:'18px',fontWeight:'700',cursor:phase==='result'?'default':'pointer',opacity,transition:'all 0.2s',textAlign:'left',display:'flex',alignItems:'center',gap:'12px',...extra}}>
                                <span style={{fontSize:'22px',opacity:0.8}}>{SHAPES[idx]}</span> {ans}
                            </button>
                        );
                    })}
                </div>

                {phase === 'result' && (
                    <div style={{marginTop:'24px',textAlign:'center',animation:'fadeIn 0.3s'}}>
                        {selected !== -1 && selected === correct
                            ? <div style={{fontSize:'22px',fontWeight:'800',color:'#22c55e'}}>✅ Correct! <span style={{color:'#f59e0b'}}>+{pointsEarned}</span></div>
                            : <div style={{fontSize:'22px',fontWeight:'800',color:'#ef4444'}}>❌ {selected === -1 ? "Time's up!" : 'Wrong!'}</div>
                        }
                    </div>
                )}
            </div>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
}

function Loader() { return <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif',fontSize:'18px'}}>Loading...</div>; }
function NoQuestions({ navigate }) { return <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>📚</div><h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',marginBottom:'8px'}}>No Questions Found</h2><button onClick={() => navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back to Play</button></div></div>; }
function Screen({ bg, children }) { return <div style={{minHeight:'100vh',background:bg,color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',position:'relative'}}>{children}</div>; }
function BackBtn({ navigate }) { return <button onClick={() => navigate('/play')} style={{position:'absolute',top:'20px',left:'20px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>; }
function Pill({ children }) { return <div style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'99px',padding:'6px 14px',fontSize:'13px',color:'#a5b4fc',fontWeight:'700'}}>{children}</div>; }
