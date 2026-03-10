export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const [user] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            const blookCount = await database.query('SELECT COUNT(*) as count FROM blooks WHERE user_id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            const friendCount = await database.query('SELECT COUNT(*) as count FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = "accepted"', { replacements: [userId, userId], type: database.QueryTypes.SELECT });
            const stats = {
                blooks: blookCount[0].count,
                tokens: user.tokens,
                friends: friendCount[0].count,
                role: user.role === 'Dev' ? 1 : 0,
            };
            const allBadges = await database.query('SELECT * FROM badges', { type: database.QueryTypes.SELECT }).catch(() => []);
            const userBadges = await database.query('SELECT badge_key FROM user_badges WHERE user_id = ?', { replacements: [userId], type: database.QueryTypes.SELECT }).catch(() => []);
            const alreadyEarned = new Set(userBadges.map(b => b.badge_key));
            const newlyEarned = [];
            for (const badge of allBadges) {
                if (alreadyEarned.has(badge.key_name)) continue;
                const stat = stats[badge.requirement_type] ?? 0;
                if (stat >= badge.requirement_value) {
                    await database.query('INSERT IGNORE INTO user_badges (user_id, badge_key) VALUES (?, ?)', { replacements: [userId, badge.key_name] });
                    await database.query('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)', { replacements: [userId, 'badge', '🏅 Badge Earned!', 'You earned the ' + badge.name + ' badge!'] });
                    newlyEarned.push(badge);
                }
            }
            return res.status(200).json({ success: true, newlyEarned });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
