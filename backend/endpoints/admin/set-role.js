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
            const { username, role } = req.body;
            if (!username || !role) return res.status(400).json({ error: 'Missing fields' });
            await database.query('UPDATE users SET role = ? WHERE username = ?', { replacements: [role, username] });
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
