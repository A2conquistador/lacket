import { useState } from 'react';
import { config } from '@stores/config';
import { Link, useNavigate } from 'react-router-dom';
import Background from '@components/Background';
import styles from '@styles';
import axios from 'axios';

export default function Authentication({ type }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ error: false, password: false, username: false, message: '' });
    const isLogin = type === 'Login';
    const submit = async () => {
        setError({ error: false, password: false, username: false, message: '' });
        if (!username) return setError({ error: true, username: true, password: false, message: 'Please enter a username.' });
        if (!password) return setError({ error: true, username: false, password: true, message: 'Please enter a password.' });
        setLoading(true);
        try {
            const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
            const res = await axios.post(endpoint, { username, password });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            const message = err && err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Something went wrong.';
            setError({ error: true, username: false, password: false, message });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.authentication.outerContainer}>
            <Background />
            <div className={styles.authentication.mainheader}>
                <Link className={styles.authentication.blacketText} to="/">{config.name}</Link>
                <Link className={styles.authentication.headerRight} to={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign Up' : 'Login'}</Link>
            </div>
            <div className={styles.authentication.regularBody}>
                <div className={styles.authentication.floatingBox}>
                    <div className={isLogin ? styles.authentication.floatingBoxHeader : styles.authentication.smallFloatingBoxHeader}>{type}</div>
                    <div className={styles.authentication.inputContainer + (error.username ? ' ' + styles.authentication.inputError : '')}>
                        <i className={'fas fa-user ' + styles.authentication.icon + (error.username ? ' ' + styles.authentication.iconError : '')} />
                        <input className={styles.authentication.input} placeholder="Username" type="text" maxLength={16} value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
                    </div>
                    <div className={styles.authentication.inputContainer + (error.password ? ' ' + styles.authentication.inputError : '')}>
                        <i className={'fas fa-lock ' + styles.authentication.icon + ' ' + styles.authentication.smallerIcon + (error.password ? ' ' + styles.authentication.iconError : '')} />
                        <input className={styles.authentication.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
                    </div>
                    <button className={styles.authentication.button + (error.error ? ' ' + styles.authentication.buttonError : '')} onClick={submit} disabled={loading}>{loading ? 'Please wait...' : "Let's Go!"}</button>
                    {error.error && <div className={styles.authentication.blErrorContainer}><i className={'fas fa-times-circle ' + styles.authentication.blErrorIcon} /><div className={styles.authentication.blErrorText}>{error.message}</div></div>}
                    <div className={styles.authentication.switchAuthTypeLink}>{isLogin ? "Don't have an account?" : 'Already have an account?'}&nbsp;<Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign up' : 'Login'}</Link>&nbsp;instead.</div>
                </div>
            </div>
        </div>
    );
}