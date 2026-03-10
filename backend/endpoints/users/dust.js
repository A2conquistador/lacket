const DUST_VALUES = { Common: 5, Uncommon: 15, Rare: 40, Epic: 100, Legendary: 300 };

export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            const { blook_ids } = req.body; // array of blook DB ids
            if (!token || !blook_ids?.length) return res.status(400).json({ error: 'Missing token or blook_ids' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;

            // Verify all blooks belong to this user
            const placeholders = blook_ids.map(() => '?').join(',');
            const owned = await database.query(
                `SELECT * FROM blooks WHERE id IN (${placeholders}) AND user_id = ?`,
                { replacements: [...blook_ids, userId], type: database.QueryTypes.SELECT }
            );
            if (owned.length !== blook_ids.length) return res.status(403).json({ error: 'You do not own all those blooks' });

            // Check not dusting equipped blook
            const [user] = await database.query('SELECT equipped_blook FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            if (user.equipped_blook) {
                const equippedInList = owned.find(b => b.blook_name === user.equipped_blook);
                if (equippedInList) return res.status(400).json({ error: 'Cannot dust your equipped blook. Unequip it first.' });
            }

            const totalTokens = owned.reduce((sum, b) => sum + (DUST_VALUES[b.rarity] || 5), 0);
            await database.query(`DELETE FROM blooks WHERE id IN (${placeholders}) AND user_id = ?`, { replacements: [...blook_ids, userId] });
            await database.query('UPDATE users SET tokens = tokens + ? WHERE id = ?', { replacements: [totalTokens, userId] });

            const [updatedUser] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            return res.status(200).json({ success: true, tokens_earned: totalTokens, dusted: owned.length, user: updatedUser });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
