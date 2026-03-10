export default {
    method: 'POST',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            const { item_id } = req.body;

            if (!token || !item_id) return res.status(400).json({ error: 'Missing token or item_id' });

            const SHOP_ITEMS = {
                'glow_blue': { name: 'Blue Glow', desc: 'Make your blooks glow blue', price: 100, emoji: '🔵', type: 'cosmetic' },
                'glow_purple': { name: 'Purple Glow', desc: 'Make your blooks glow purple', price: 100, emoji: '🟣', type: 'cosmetic' },
                'glow_gold': { name: 'Golden Glow', desc: 'Make your blooks glow gold', price: 200, emoji: '🟡', type: 'cosmetic' },
                'name_color_red': { name: 'Red Name Color', desc: 'Your username appears in red', price: 50, emoji: '🔴', type: 'cosmetic' },
                'name_color_gold': { name: 'Gold Name Color', desc: 'Your username appears in gold', price: 150, emoji: '✨', type: 'cosmetic' },
                'name_color_rainbow': { name: 'Rainbow Name', desc: 'Your username cycles through colors', price: 300, emoji: '🌈', type: 'cosmetic' },
                'badge_trophy': { name: 'Trophy Badge', desc: 'Display a trophy badge', price: 75, emoji: '🏆', type: 'badge' },
                'badge_crown': { name: 'Crown Badge', desc: 'Display a crown badge', price: 100, emoji: '👑', type: 'badge' },
                'badge_star': { name: 'Star Badge', desc: 'Display a star badge', price: 125, emoji: '⭐', type: 'badge' },
                'title_legend': { name: '"Legend" Title', desc: 'Show "Legend" under your name', price: 200, emoji: '🗡️', type: 'title' },
                'title_master': { name: '"Master" Title', desc: 'Show "Master" under your name', price: 150, emoji: '🎯', type: 'title' },
                'title_elite': { name: '"Elite" Title', desc: 'Show "Elite" under your name', price: 100, emoji: '💎', type: 'title' },
                'profile_border_gold': { name: 'Gold Profile Border', desc: 'Gold border on your profile', price: 100, emoji: '🟨', type: 'cosmetic' },
                'profile_border_diamond': { name: 'Diamond Border', desc: 'Diamond pattern profile border', price: 250, emoji: '💠', type: 'cosmetic' },
            };

            const item = SHOP_ITEMS[item_id];
            if (!item) return res.status(404).json({ error: 'Item not found' });

            // Get user from session
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { 
                replacements: [token], 
                type: database.QueryTypes.SELECT 
            });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });

            const userId = sessions[0].user_id;

            // Check user tokens
            const users = await database.query('SELECT tokens FROM users WHERE id = ?', { 
                replacements: [userId], 
                type: database.QueryTypes.SELECT 
            });

            if (!users.length) return res.status(404).json({ error: 'User not found' });
            if (users[0].tokens < item.price) return res.status(400).json({ error: 'Not enough tokens' });

            // Check if already owned
            const owned = await database.query('SELECT * FROM shop_items WHERE user_id = ? AND item_id = ?', { 
                replacements: [userId, item_id], 
                type: database.QueryTypes.SELECT 
            });

            if (owned.length > 0) return res.status(400).json({ error: 'Already owned' });

            // Deduct tokens
            await database.query('UPDATE users SET tokens = tokens - ? WHERE id = ?', { 
                replacements: [item.price, userId] 
            });

            // Add to inventory
            await database.query('INSERT INTO shop_items (user_id, item_id, purchased_at) VALUES (?, ?, NOW())', { 
                replacements: [userId, item_id] 
            });

            // Get updated tokens
            const updated = await database.query('SELECT tokens FROM users WHERE id = ?', { 
                replacements: [userId], 
                type: database.QueryTypes.SELECT 
            });

            res.json({ success: true, tokens: updated[0].tokens, item });
        } catch (err) {
            console.error('Shop error:', err);
            res.status(500).json({ error: err.message });
        }
    }
};
