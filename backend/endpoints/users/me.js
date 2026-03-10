export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const rows = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (rows.length === 0) return res.status(401).json({ error: "Unauthorized." });
            const users = await database.query("SELECT id, username, tokens, created_at, equipped_blook, role, banned FROM users WHERE id = ?", { replacements: [rows[0].user_id], type: database.QueryTypes.SELECT });
            if (users.length === 0) return res.status(404).json({ error: "User not found." });
            const user = users[0];
            if (!user.equipped_blook) user.equipped_blook = "Default.png";
            const blooks = await database.query("SELECT blook_name, rarity, COUNT(*) as count FROM blooks WHERE user_id = ? GROUP BY blook_name, rarity", { replacements: [user.id], type: database.QueryTypes.SELECT });
            user.blooks = blooks;
            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error." });
        }
    }
};
