export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const [me] = await database.query('SELECT role FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            if (me.role !== 'Dev') return res.status(403).json({ error: 'Forbidden' });
            const { username, amount } = req.body;
            if (!username || !amount) return res.status(400).json({ error: 'Missing fields' });
            const [target] = await database.query('SELECT id FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (!target) return res.status(404).json({ error: 'User not found' });
            await database.query('UPDATE users SET tokens = tokens + ? WHERE id = ?', { replacements: [amount, target.id] });
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
