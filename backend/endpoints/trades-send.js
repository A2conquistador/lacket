export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const { targetUsername, myBlookId, theirBlookId } = req.body;
            if (!targetUsername || !myBlookId || !theirBlookId) return res.status(400).json({ error: 'Missing fields' });
            const [target] = await database.query('SELECT id, username FROM users WHERE username = ?', { replacements: [targetUsername], type: database.QueryTypes.SELECT });
            if (!target) return res.status(404).json({ error: 'User not found' });
            const [myBlook] = await database.query('SELECT * FROM blooks WHERE id = ? AND user_id = ?', { replacements: [myBlookId, userId], type: database.QueryTypes.SELECT });
            if (!myBlook) return res.status(403).json({ error: 'You do not own that blook' });
            const [theirBlook] = await database.query('SELECT * FROM blooks WHERE id = ? AND user_id = ?', { replacements: [theirBlookId, target.id], type: database.QueryTypes.SELECT });
            if (!theirBlook) return res.status(403).json({ error: 'Target does not own that blook' });
            await database.query('INSERT INTO trades (sender_id, receiver_id, sender_blook_id, receiver_blook_id, status) VALUES (?, ?, ?, ?, ?)', { replacements: [userId, target.id, myBlookId, theirBlookId, 'pending'] });
            const [sender] = await database.query('SELECT username FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            await database.query("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'trade', '🔄 Trade Offer', ?)", { replacements: [target.id, `${sender.username} wants to trade ${myBlook.blook_name} for your ${theirBlook.blook_name}!`] });
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
