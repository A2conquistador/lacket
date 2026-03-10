export default {
    method: "POST",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;
            const { username } = req.body;
            if (!username) return res.status(400).json({ error: "Username required." });
            const [target] = await database.query("SELECT id, username FROM users WHERE username = ?", { replacements: [username], type: database.QueryTypes.SELECT });
            if (!target) return res.status(404).json({ error: "User not found." });
            if (target.id === userId) return res.status(400).json({ error: "You can't friend yourself." });
            const existing = await database.query("SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", { replacements: [userId, target.id, target.id, userId], type: database.QueryTypes.SELECT });
            if (existing.length) return res.status(400).json({ error: "Friend request already exists." });
            await database.query("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')", { replacements: [userId, target.id] });
            // Notify the target
            const [sender] = await database.query("SELECT username FROM users WHERE id = ?", { replacements: [userId], type: database.QueryTypes.SELECT });
            await database.query("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'friend', '👥 Friend Request', ?)", { replacements: [target.id, `${sender.username} sent you a friend request!`] });
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
