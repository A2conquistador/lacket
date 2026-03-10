import bcrypt from 'bcrypt';
import crypto from 'crypto';
export default {
    uri: '/api/users/register',
    type: 'post',
    auth: false,
    async run(req, res) {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing username or password.' });
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) return res.status(400).json({ error: 'Username must be 3-16 characters, letters/numbers/underscores only.' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        try {
            const existing = await database.query('SELECT id FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (existing.length > 0) return res.status(409).json({ error: 'Username is already taken.' });
            const hash = await bcrypt.hash(password, 10);
            await database.query('INSERT INTO users (username, password, tokens, created_at) VALUES (?, ?, 0, NOW())', { replacements: [username, hash] });
            const [user] = await database.query('SELECT id FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            const token = crypto.randomBytes(32).toString('hex');
            await database.query('INSERT INTO sessions (user_id, token) VALUES (?, ?)', { replacements: [user.id, token] });
            res.status(200).json({ token, user: { id: user.id, username } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
}
