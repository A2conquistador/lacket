export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const quests = await database.query('SELECT * FROM quests LIMIT 20', { type: database.QueryTypes.SELECT });
            res.json({ success: true, quests });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch quests' });
        }
    }
}
