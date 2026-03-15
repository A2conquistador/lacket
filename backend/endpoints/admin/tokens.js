export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await database.query('SELECT * FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
    if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
    const [me] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
    const roleRank = { Player:0, BetaTester:1, VIP:2, Moderator:3, Admin:4, Dev:5, Owner:6 };
    if (!me || roleRank[me.role] < 5) return res.status(403).json({ error: 'Forbidden' });

            const { username, amount } = req.body;
            if (!username || amount === undefined) return res.status(400).json({ error: 'Missing fields' });
            await database.query('UPDATE users SET tokens = tokens + ? WHERE username = ?', { replacements: [parseInt(amount), username] });
            const [user] = await database.query('SELECT id, username, tokens FROM users WHERE username = ?', { replacements: [username], type: database.QueryTypes.SELECT });
            res.json({ success: true, user });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};