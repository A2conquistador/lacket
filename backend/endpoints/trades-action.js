export default {
    method: "POST",
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;
            const { tradeId, action } = req.body;
            if (!tradeId || !action) return res.status(400).json({ error: "Missing fields." });
            const [trade] = await database.query("SELECT * FROM trades WHERE id = ?", { replacements: [tradeId], type: database.QueryTypes.SELECT });
            if (!trade) return res.status(404).json({ error: "Trade not found." });
            if (action === "cancel" && trade.sender_id !== userId) return res.status(403).json({ error: "Forbidden." });
            if ((action === "accept" || action === "decline") && trade.receiver_id !== userId) return res.status(403).json({ error: "Forbidden." });
            if (trade.status !== "pending") return res.status(400).json({ error: "Trade is no longer pending." });
            if (action === "accept") {
                // Verify both still own the blooks
                const [senderBlook] = await database.query("SELECT * FROM blooks WHERE id = ? AND user_id = ?", { replacements: [trade.sender_blook_id, trade.sender_id], type: database.QueryTypes.SELECT });
                if (!senderBlook) return res.status(400).json({ error: "Sender no longer owns that blook." });
                if (trade.receiver_blook_id) {
                    const [receiverBlook] = await database.query("SELECT * FROM blooks WHERE id = ? AND user_id = ?", { replacements: [trade.receiver_blook_id, trade.receiver_id], type: database.QueryTypes.SELECT });
                    if (!receiverBlook) return res.status(400).json({ error: "You no longer own that blook." });
                    await database.query("UPDATE blooks SET user_id = ? WHERE id = ?", { replacements: [trade.sender_id, trade.receiver_blook_id] });
                }
                await database.query("UPDATE blooks SET user_id = ? WHERE id = ?", { replacements: [trade.receiver_id, trade.sender_blook_id] });
                await database.query("UPDATE trades SET status = 'accepted' WHERE id = ?", { replacements: [tradeId] });
            } else {
                await database.query("UPDATE trades SET status = ? WHERE id = ?", { replacements: [action === "cancel" ? "cancelled" : "declined", tradeId] });
            }
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
