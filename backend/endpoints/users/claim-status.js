export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const todayClaim = await database.query('SELECT * FROM daily_claims WHERE user_id = ? AND claim_date = ?', { replacements: [userId, today], type: database.QueryTypes.SELECT });
            const prevClaim = await database.query('SELECT * FROM daily_claims WHERE user_id = ? AND claim_date = ? ORDER BY id DESC LIMIT 1', { replacements: [userId, yesterday], type: database.QueryTypes.SELECT });
            const claimed = todayClaim.length > 0;
            const streak = claimed ? todayClaim[0].streak : (prevClaim.length ? prevClaim[0].streak : 0);
            const nextTokens = [25,30,40,50,65,80,200][Math.min((claimed?streak:streak)%7, 6)];
            return res.status(200).json({ claimed, streak, next_tokens: nextTokens });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
