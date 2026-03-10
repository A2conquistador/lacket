import bcrypt from 'bcrypt';
import crypto from 'crypto';
export default {
    uri: '/api/users/login',
    type: 'post',
    auth: false,
    async run(req, res) {
        const { username, password } = req.body;
        try {
            const [user] = await database.query('SELECT * FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ error: 'Invalid username or password.' });
            const token = crypto.randomBytes(32).toString('hex');
            await database.query('INSERT INTO sessions (user_id, token) VALUES (?, ?)', { replacements: [user.id, token] });
            res.status(200).json({ token, user: { id: user.id, username: user.username } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
}
