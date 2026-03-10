export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const blooks = await database.query('SELECT * FROM blooks WHERE user_id = ? ORDER BY id ASC', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            return res.status(200).json(blooks);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
