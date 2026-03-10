import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export function useGameQuestions() {
    const [searchParams] = useSearchParams();
    const setId = searchParams.get('set');
    
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!setId) {
            setError('No question set selected');
            setLoading(false);
            return;
        }

        console.log('Loading questions for set:', setId);

        axios.get('/api/sets-get?id='+setId, { headers: { authorization: token } })
            .then(res => {
                console.log('API Response:', res.data);
                
                // Handle the response structure
                const questionsData = res.data.questions || res.data;
                
                if (Array.isArray(questionsData) && questionsData.length > 0) {
                    setQuestions(questionsData);
                } else {
                    setError('No questions found in this set');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading questions:', err);
                setError('Failed to load questions: ' + (err.response?.data?.error || err.message));
                setLoading(false);
            });
    }, [setId, token]);

    return { questions, loading, error };
}
