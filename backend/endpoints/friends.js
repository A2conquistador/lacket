export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;

            // Get requests sent by others to me (pending)
            const incoming = await database.query(`
                SELECT u.id, u.username, u.equipped_blook, u.tokens, f.status, f.user_id as requester_id
                FROM friends f JOIN users u ON u.id = f.user_id
                WHERE f.friend_id = ? AND f.status = 'pending'
            `, { replacements: [userId], type: database.QueryTypes.SELECT });

            // Get requests I sent (pending)
            const outgoing = await database.query(`
                SELECT u.id, u.username, u.equipped_blook, u.tokens, f.status, f.user_id as requester_id
                FROM friends f JOIN users u ON u.id = f.friend_id
                WHERE f.user_id = ? AND f.status = 'pending'
            `, { replacements: [userId], type: database.QueryTypes.SELECT });

            // Get accepted friends (only one direction since we insert both)
            const accepted = await database.query(`
                SELECT u.id, u.username, u.equipped_blook, u.tokens, f.status, f.user_id as requester_id
                FROM friends f JOIN users u ON u.id = f.friend_id
                WHERE f.user_id = ? AND f.status = 'accepted'
            `, { replacements: [userId], type: database.QueryTypes.SELECT });

            return res.status(200).json([...incoming, ...outgoing, ...accepted]);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
