export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await global.database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: global.database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const [user] = await global.database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: global.database.QueryTypes.SELECT });
            if (!user) return res.status(404).json({ error: 'User not found' });
            const { id, content } = req.body;
            if (!id || !content) return res.status(400).json({ error: 'Missing fields' });
            const [msg] = await global.database.query('SELECT * FROM messages WHERE id = ?', { replacements: [id], type: global.database.QueryTypes.SELECT });
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            if (msg.user_id !== user.id && !['Dev','Admin','Moderator'].includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
            const clean = String(content).trim().slice(0, 300);
            if (!clean) return res.status(400).json({ error: 'Empty message' });
            await global.database.query('UPDATE messages SET content = ? WHERE id = ?', { replacements: [clean, id] });
            res.json({ success: true, content: clean });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};