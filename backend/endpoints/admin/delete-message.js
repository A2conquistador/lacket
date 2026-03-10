export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await global.database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: global.database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const [me] = await global.database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: global.database.QueryTypes.SELECT });
            if (!me) return res.status(404).json({ error: 'User not found' });
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing message id' });
            const [msg] = await global.database.query('SELECT * FROM messages WHERE id = ?', { replacements: [id], type: global.database.QueryTypes.SELECT });
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            if (msg.user_id !== me.id && !['Dev','Admin','Moderator'].includes(me.role)) return res.status(403).json({ error: 'Forbidden' });
            await global.database.query('DELETE FROM messages WHERE id = ?', { replacements: [id] });
            res.json({ success: true });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};