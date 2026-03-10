export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const username = req.query.username || req.url.split("/").pop().split("?")[0];
            if (!username) return res.status(400).json({ error: "No username." });
            const [user] = await database.query("SELECT id, username, tokens, equipped_blook, created_at FROM users WHERE username = ?", { replacements: [username], type: database.QueryTypes.SELECT });
            if (!user) return res.status(404).json({ error: "User not found." });
            const blooks = await database.query("SELECT blook_name, rarity, COUNT(*) as count FROM blooks WHERE user_id = ? GROUP BY blook_name, rarity ORDER BY FIELD(rarity, 'Chroma','Mythic','Legendary','Epic','Rare','Uncommon','Common')", { replacements: [user.id], type: database.QueryTypes.SELECT });
            const [blookCount] = await database.query("SELECT COUNT(*) as total FROM blooks WHERE user_id = ?", { replacements: [user.id], type: database.QueryTypes.SELECT });
            user.blooks = blooks;
            user.blook_count = blookCount.total;
            return res.status(200).json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
