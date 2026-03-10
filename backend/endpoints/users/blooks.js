export default {
    method: 'GET',
    handler: async (req, res) => {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
        if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
        const blooks = await database.query(
            'SELECT blook_name, rarity, COUNT(*) as count FROM blooks WHERE user_id = ? GROUP BY blook_name, rarity',
            { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT }
        );
        res.json(blooks);
    }
};
