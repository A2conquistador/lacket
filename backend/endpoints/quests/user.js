export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: 'Unauthorized' });
            const sessions = await database.query('SELECT user_id FROM sessions WHERE token = ?', { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: 'Unauthorized' });
            const userId = sessions[0].user_id;
            const userQuests = await database.query('SELECT q.*, uq.progress, uq.completed FROM quests q JOIN user_quests uq ON q.id = uq.quest_id WHERE uq.user_id = ? ORDER BY uq.completed ASC', { replacements: [userId], type: database.QueryTypes.SELECT });
            res.json({ success: true, quests: userQuests });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch user quests' });
        }
    }
}
