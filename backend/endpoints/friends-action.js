export default {
    method: "POST",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;
            const { friendId, action } = req.body;
            if (!friendId || !action) return res.status(400).json({ error: "Missing fields." });
            if (action === "accept") {
                await database.query("UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ?", { replacements: [friendId, userId] });
                await database.query("INSERT IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", { replacements: [userId, friendId] });
            } else if (action === "decline" || action === "remove") {
                await database.query("DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", { replacements: [userId, friendId, friendId, userId] });
            }
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
