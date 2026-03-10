export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const { username } = req.body;
            if (!username || username.length < 3) return res.status(400).json({ error: 'Username too short' });
            if (username.length > 20) return res.status(400).json({ error: 'Username too long' });
            const existing = await database.query('SELECT id FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (existing.length) return res.status(400).json({ error: 'Username taken' });
            await database.query('UPDATE users SET username = ? WHERE id = ?', { replacements: [username, sessions[0].user_id] });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
