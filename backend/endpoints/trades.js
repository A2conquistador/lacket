export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;
            const trades = await database.query(`
                SELECT t.*,
                    su.username as sender_username, su.equipped_blook as sender_avatar,
                    ru.username as receiver_username, ru.equipped_blook as receiver_avatar,
                    sb.blook_name as sender_blook_name, sb.rarity as sender_blook_rarity,
                    rb.blook_name as receiver_blook_name, rb.rarity as receiver_blook_rarity
                FROM trades t
                JOIN users su ON su.id = t.sender_id
                JOIN users ru ON ru.id = t.receiver_id
                JOIN blooks sb ON sb.id = t.sender_blook_id
                LEFT JOIN blooks rb ON rb.id = t.receiver_blook_id
                WHERE (t.sender_id = ? OR t.receiver_id = ?) AND t.status = 'pending'
                ORDER BY t.created_at DESC
            `, { replacements: [userId, userId], type: database.QueryTypes.SELECT });
            return res.status(200).json(trades);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
