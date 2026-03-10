export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            const { blook } = req.body;
            if (!token || !blook) return res.status(400).json({ error: 'Missing' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            await database.query('UPDATE users SET equipped_blook = ? WHERE id = ?', { replacements: [blook, sessions[0].user_id] });
            const user = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            res.json({ user: user[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed' });
        }
    }
}
