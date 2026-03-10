export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const notifs = await database.query(
                'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
                { replacements: [userId], type: database.QueryTypes.SELECT }
            );
            const unread = notifs.filter(n => !n.read_at).length;
            return res.status(200).json({ notifications: notifs, unread });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
