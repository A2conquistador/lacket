export default {
    method: "POST",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized" });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized" });
            const [me] = await database.query("SELECT * FROM users WHERE id = ?", { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });
            const roleRank = { Player:0, BetaTester:1, VIP:2, Moderator:3, Admin:4, Dev:5, Owner:6, God:7, Creator:8 };
            if (!me || roleRank[me.role] < 4) return res.status(403).json({ error: "Forbidden" });

            const { message } = req.body;
            if (!message) return res.status(400).json({ error: "Missing message" });

            // Save to messages table as announcement
            await database.query(
                "INSERT INTO messages (user_id, username, role, content, created_at) VALUES (?, ?, ?, ?, NOW())",
                { replacements: [me.id, "📢 ANNOUNCEMENT", me.role, message] }
            );

            // Broadcast via WebSocket to all connected clients
            if (global.wss) {
                global.wss.clients.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({
                            type: "announce",
                            message: {
                                id: Date.now(),
                                username: "📢 ANNOUNCEMENT",
                                role: me.role,
                                content: message,
                                created_at: new Date()
                            }
                        }));
                    }
                });
            }

            res.json({ success: true });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};
