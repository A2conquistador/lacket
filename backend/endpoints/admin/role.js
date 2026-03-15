export default {
    method: "POST",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized" });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized" });
            const [me] = await database.query("SELECT * FROM users WHERE id = ?", { replacements: [sessions[0].user_id], type: database.QueryTypes.SELECT });

            const roleRank = { "Player": 0, "BetaTester": 1, "VIP": 2, "Moderator": 3, "Admin": 4, "Dev": 5, "Owner": 6, "God": 7, "Creator": 8 };
            if (!me || roleRank[me.role] < 3) return res.status(403).json({ error: "Forbidden" });

            const { username, role } = req.body;
            if (!username || !role) return res.status(400).json({ error: "Missing fields" });

            const validRoles = ["Player","BetaTester","VIP","Moderator","Admin","Dev","Owner","God","Creator"];
            if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

            const [target] = await database.query("SELECT * FROM users WHERE username = ?", { replacements: [username], type: database.QueryTypes.SELECT });
            if (!target) return res.status(404).json({ error: "User not found" });

            if (me.role !== "Owner" && me.role !== "God" && me.role !== "Creator") {
                if (roleRank[role] >= roleRank[me.role]) return res.status(403).json({ error: "You cannot assign a role equal to or higher than your own" });
                if (roleRank[target.role] >= roleRank[me.role]) return res.status(403).json({ error: "You cannot change the role of someone with equal or higher rank" });
            }

            await database.query("UPDATE users SET role = ? WHERE username = ?", { replacements: [role, username] });
            res.json({ success: true });
        } catch(err) { res.status(500).json({ error: err.message }); }
    }
};
