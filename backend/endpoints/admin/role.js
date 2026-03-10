export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const [me] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            if (!me || me.role !== 'Dev') return res.status(403).json({ error: 'Forbidden' });
            const { username, role } = req.body;
            if (!username || !role) return res.status(400).json({ error: 'Missing fields' });
            const validRoles = ['Player','VIP','Moderator','Admin','Dev'];
            if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
            const [target] = await database.query('SELECT * FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (!target) return res.status(404).json({ error: 'User not found' });
            await database.query('UPDATE users SET role = ? WHERE username = ?', { replacements: [role, username] });
            res.json({ success: true });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};
