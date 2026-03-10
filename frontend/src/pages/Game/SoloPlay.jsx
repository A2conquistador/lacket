import { useState, useEffect } from 'react';
import { sounds } from '@stores/sounds';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function SoloPlay() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const setId = searchParams.get('set');
    
    const [set, setSet] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15);
    const [timerActive, setTimerActive] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        // Load the question set
        if (setId) {
            axios.get('/api/sets-get?id='+setId, { headers: { authorization: token } })
                .then(res => {
                    setSet(res.data);
                    setQuestions(res.data.questions || []);
                    setLoading(false);
                })
                .catch(() => {
                    alert('Failed to load set');
                    navigate('/play');
                });
        }
    }, [setId, token, navigate]);

    // Timer
    useEffect(() => {
        if (!timerActive || answered || gameOver || !questions.length) return;
        
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setTimerActive(false);
                    handleTimeout();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [timerActive, answered, gameOver, questions.length]);

    const handleTimeout = () => {
        sounds.timeUp();
        setAnswered(true);
        setSelectedAnswer(null);
    };

    const handleAnswerClick = (answerIndex) => {
        if (answered) return;
        
        setSelectedAnswer(answerIndex);
        setAnswered(true);
        setTimerActive(false);

        const question = questions[currentQ];
        if (answerIndex === question.correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
            setAnswered(false);
            setTimeLeft(15);
            setTimerActive(true);
        } else {
            setGameOver(true);
        }
    };

    const restartGame = () => {
        setCurrentQ(0);
        setScore(0);
        setAnswered(false);
        setSelectedAnswer(null);
        setGameOver(false);
        setTimeLeft(15);
        setTimerActive(true);
    };

    if (loading) return <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif'}}>Loading...</div>;

    if (!questions.length) {
        return (
            <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'48px',marginBottom:'16px'}}>📚</div>
                    <h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'28px',marginBottom:'8px'}}>No Questions Found</h2>
                    <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>This set doesn't have any questions yet.</p>
                    <button onClick={() => navigate('/play')} style={{padding:'12px 24px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}>Back to Play</button>
                </div>
            </div>
        );
    }

    const question = questions[currentQ];
    const isCorrect = selectedAnswer === question.correct;

    return (
        <div style={{minHeight:'100vh',background:'#05071a',color:'#fff',fontFamily:'Nunito,sans-serif',padding:'20px'}}>
            {/* Header */}
            <div style={{maxWidth:'800px',margin:'0 auto 40px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <button onClick={() => navigate('/play')} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontSize:'14px',fontWeight:'700',padding:'8px 16px',cursor:'pointer'}}>← Back</button>
                <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:'4px'}}>Score</div>
                    <div style={{fontSize:'24px',fontWeight:'800',color:'#f59e0b'}}>{score} / {questions.length}</div>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:'4px'}}>Question</div>
                    <div style={{fontSize:'24px',fontWeight:'800',color:'#a5b4fc'}}>{currentQ + 1} / {questions.length}</div>
                </div>
            </div>

            {!gameOver ? (
                <div style={{maxWidth:'800px',margin:'0 auto'}}>
                    {/* Timer */}
                    <div style={{marginBottom:'32px',textAlign:'center'}}>
                        <div style={{position:'relative',width:'120px',height:'120px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <svg style={{position:'absolute',width:'120px',height:'120px',transform:'rotate(-90deg)'}}>
                                <circle cx='60' cy='60' r='50' fill='none' stroke='rgba(99,102,241,0.2)' strokeWidth='8' />
                                <circle
                                    cx='60'
                                    cy='60'
                                    r='50'
                                    fill='none'
                                    stroke={timeLeft <= 5 ? '#ef4444' : '#6366f1'}
                                    strokeWidth='8'
                                    strokeDasharray={`${(timeLeft / 15) * 314} 314`}
                                    style={{transition:'stroke-dasharray 0.3s'}}
                                />
                            </svg>
                            <div style={{fontSize:'40px',fontWeight:'900',color:timeLeft<=5?'#ef4444':'#6366f1'}}>{timeLeft}s</div>
                        </div>
                    </div>

                    {/* Question */}
                    <div style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'16px',padding:'32px',marginBottom:'32px'}}>
                        <h2 style={{fontSize:'24px',fontWeight:'800',color:'#e0e7ff',margin:'0 0 24px',lineHeight:'1.4'}}>{question.question}</h2>
                        
                        {/* Answers */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                            {question.answers.map((answer, idx) => {
                                let bgColor = 'rgba(99,102,241,0.08)';
                                let borderColor = 'rgba(99,102,241,0.2)';
                                let textColor = '#e0e7ff';
                                let cursor = 'pointer';

                                if (answered) {
                                    if (idx === question.correct) {
                                        bgColor = 'rgba(34,197,94,0.15)';
                                        borderColor = '#22c55e';
                                        textColor = '#86efac';
                                    } else if (idx === selectedAnswer && !isCorrect) {
                                        bgColor = 'rgba(239,68,68,0.15)';
                                        borderColor = '#ef4444';
                                        textColor = '#fca5a5';
                                    } else {
                                        bgColor = 'rgba(99,102,241,0.05)';
                                        borderColor = 'rgba(99,102,241,0.1)';
                                        textColor = 'rgba(255,255,255,0.4)';
                                    }
                                    cursor = 'default';
                                } else if (selectedAnswer === idx) {
                                    bgColor = 'rgba(99,102,241,0.2)';
                                    borderColor = '#6366f1';
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerClick(idx)}
                                        style={{
                                            background: bgColor,
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: '12px',
                                            padding: '16px',
                                            color: textColor,
                                            fontFamily: 'Nunito,sans-serif',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: cursor,
                                            transition: 'all 0.2s',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {answer}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {answered && (
                        <div style={{textAlign:'center'}}>
                            <div style={{fontSize:'18px',marginBottom:'20px',color:isCorrect?'#22c55e':'#ef4444',fontWeight:'700'}}>
                                {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
                            </div>
                            {isCorrect && (
                                <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',marginBottom:'20px'}}>
                                    The correct answer was: <span style={{color:'#22c55e',fontWeight:'700'}}>{question.answers[question.correct]}</span>
                                </div>
                            )}
                            <button
                                onClick={nextQuestion}
                                style={{padding:'12px 32px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}
                            >
                                {currentQ === questions.length - 1 ? 'See Results' : 'Next Question'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Results Screen */
                <div style={{maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
                    <div style={{fontSize:'64px',marginBottom:'24px'}}>
                        {score === questions.length ? '🏆' : score >= questions.length * 0.7 ? '🎉' : '📚'}
                    </div>
                    <h2 style={{fontFamily:'Titan One,sans-serif',fontSize:'36px',color:'#e0e7ff',marginBottom:'16px'}}>Game Over!</h2>
                    
                    <div style={{background:'linear-gradient(135deg,#0d1240,#0a0f2e)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'16px',padding:'32px',marginBottom:'32px'}}>
                        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:'12px',fontWeight:'700'}}>Final Score</div>
                        <div style={{fontSize:'64px',fontWeight:'900',background:'linear-gradient(135deg,#f59e0b,#ef4444)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'24px'}}>
                            {score}/{questions.length}
                        </div>
                        <div style={{fontSize:'16px',color:'#a5b4fc',marginBottom:'8px'}}>
                            Accuracy: <span style={{fontWeight:'800',color:'#f59e0b'}}>{Math.round((score/questions.length)*100)}%</span>
                        </div>
                        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)'}}>
                            {score === questions.length ? '💯 Perfect Score!' : score >= questions.length * 0.7 ? '⭐ Great Job!' : '👍 Good Try!'}
                        </div>
                    </div>

                    <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                        <button
                            onClick={restartGame}
                            style={{padding:'12px 32px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:'10px',color:'#fff',fontWeight:'700',cursor:'pointer'}}
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => navigate('/play')}
                            style={{padding:'12px 32px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'10px',color:'#a5b4fc',fontWeight:'700',cursor:'pointer'}}
                        >
                            Back to Games
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
