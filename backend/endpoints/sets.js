export default {
    type: "get",
    run: async (req, res) => {
        try {
            const sets = await database.query(
                "SELECT s.id, s.title, s.description, s.created_at, u.username, JSON_LENGTH(s.questions) as question_count FROM sets s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 50",
                { type: database.QueryTypes.SELECT }
            );
            return res.status(200).json(sets);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
