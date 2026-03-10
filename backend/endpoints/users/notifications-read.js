export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            await database.query(
                'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
                { replacements: [userId] }
            );
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
