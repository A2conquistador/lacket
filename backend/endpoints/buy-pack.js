export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            const { pack } = req.body;
            if (!token || !pack) return res.status(400).json({ error: 'Missing token or pack' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const PACKS = global.config.game.packs;
            const packData = PACKS[pack];
            if (!packData) return res.status(404).json({ error: 'Pack not found: ' + pack });
            const [user] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            if (user.tokens < packData.price) return res.status(400).json({ error: 'Not enough tokens' });
            const rarities = global.config.game.rarities;
            const blooks = Object.entries(packData.blooks);
            // Build weighted pool based on each blook rarity chance
            const pool = [];
            for (const [blookName, blookData] of blooks) {
                const rarityData = rarities[blookData.rarity];
                const weight = rarityData ? rarityData.chance : 1;
                const slots = Math.max(1, Math.round(weight * 10));
                const cleanName = blookName.replace(/\.(png|gif)$/i, '');
                for (let i = 0; i < slots; i++) pool.push({ name: cleanName, rarity: blookData.rarity });
            }
            const picked = pool[Math.floor(Math.random() * pool.length)];
            await database.query('UPDATE users SET tokens = tokens - ? WHERE id = ?', { replacements: [packData.price, userId] });
            await database.query('INSERT INTO blooks (user_id, blook_name, rarity) VALUES (?, ?, ?)', { replacements: [userId, picked.name, picked.rarity] });
            const [updatedUser] = await database.query('SELECT * FROM users WHERE id = ?', { replacements: [userId], type: database.QueryTypes.SELECT });
            return res.status(200).json({ success: true, blook: picked.name, rarity: picked.rarity, user: updatedUser });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
