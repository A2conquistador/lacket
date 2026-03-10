export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
    if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
    const [me] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
    if (!me || me.role !== 'Dev') return res.status(403).json({ error: 'Forbidden' });

            const users = await database.query('SELECT id, username, tokens, role, banned, created_at FROM users ORDER BY created_at DESC', { type: database.QueryTypes.SELECT });
            res.json(users);
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};