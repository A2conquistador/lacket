export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const username = req.query.username;
            if (!username) return res.status(400).json({ error: "No username." });
            const [user] = await database.query("SELECT id FROM users WHERE username = ?", { replacements: [username], type: database.QueryTypes.SELECT });
            if (!user) return res.status(404).json({ error: "User not found." });
            const blooks = await database.query("SELECT id, blook_name, rarity FROM blooks WHERE user_id = ? ORDER BY id DESC", { replacements: [user.id], type: database.QueryTypes.SELECT });
            return res.status(200).json(blooks);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
