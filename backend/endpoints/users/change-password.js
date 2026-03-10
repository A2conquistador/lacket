export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const { password } = req.body;
            if (!password || password.length < 6) return res.status(400).json({ error: 'Password too short' });
            const bcrypt = await import('bcrypt');
            const hash = await bcrypt.hash(password, 10);
            await database.query('UPDATE users SET password = ? WHERE id = ?', { replacements: [hash, sessions[0].user_id] });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
