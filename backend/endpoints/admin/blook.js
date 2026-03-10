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

            const { username, blook_name, rarity } = req.body;
            if (!username || !blook_name) return res.status(400).json({ error: 'Missing fields' });
            const [user] = await database.query('SELECT id FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            if (!user) return res.status(404).json({ error: 'User not found' });
            await database.query('INSERT INTO blooks (user_id, blook_name, rarity) VALUES (?, ?, ?)', { replacements: [user.id, blook_name, rarity || 'Common'] });
            res.json({ success: true });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};