export default {
    type: "post",
    schema: { amount: { required: true, type: "number" } },
    run: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (sessions.length === 0) return res.status(401).json({ error: "Unauthorized." });
            const amount = Math.min(Math.max(0, Math.floor(req.body.amount)), 800);
            await database.query("UPDATE users SET tokens = tokens + ? WHERE id = ?", { replacements: [amount, sessions[0].user_id] });
            const [user] = await database.query("SELECT id, username, tokens, equipped_blook FROM users WHERE id = ?", { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            return res.status(200).json({ success: true, user });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
