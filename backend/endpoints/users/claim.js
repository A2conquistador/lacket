export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const today = new Date().toISOString().slice(0, 10);
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const existing = await database.query('SELECT * FROM daily_claims WHERE user_id = ? AND claim_date = ?', { replacements: [userId, today], type: database.QueryTypes.SELECT });
            if (existing.length) return res.status(400).json({ error: 'Already claimed today' });
            const prevClaim = await database.query('SELECT * FROM daily_claims WHERE user_id = ? AND claim_date = ? ORDER BY id DESC LIMIT 1', { replacements: [userId, yesterday], type: database.QueryTypes.SELECT });
            const streak = prevClaim.length ? prevClaim[0].streak + 1 : 1;
            const tokensAwarded = [25,30,40,50,65,80,200][Math.min((streak-1)%7, 6)];
            await database.query('INSERT INTO daily_claims (user_id, claim_date, streak, tokens_awarded) VALUES (?, ?, ?, ?)', { replacements: [userId, today, streak, tokensAwarded] });
            await database.query('UPDATE users SET tokens = tokens + ? WHERE id = ?', { replacements: [tokensAwarded, userId] });
            const [updatedUser] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            return res.status(200).json({ success: true, streak, tokens_awarded: tokensAwarded, user: updatedUser });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
