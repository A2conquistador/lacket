export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;

            const allBadges = await database.query('SELECT * FROM badges ORDER BY category, id', { type: database.QueryTypes.SELECT });
            const userBadges = await database.query('SELECT badge_key, earned_at FROM user_badges WHERE user_id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            const earned = new Set(userBadges.map(b => b.badge_key));
            const earnedMap = Object.fromEntries(userBadges.map(b => [b.badge_key, b.earned_at]));

            const badges = allBadges.map(b => ({
                ...b,
                earned: earned.has(b.key_name),
                earned_at: earnedMap[b.key_name] || null
            }));

            return res.status(200).json({ badges, earned_count: earned.size, total_count: allBadges.length });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
