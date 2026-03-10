export default {
    method: "GET",
    handler: async (req, res) => {
        try {
            const id = req.query.id;
            if (!id) return res.status(400).json({ error: "No set ID." });
            const [set] = await database.query("SELECT s.*, u.username FROM sets s JOIN users u ON s.user_id = u.id WHERE s.id = ?", { replacements: [id], type: database.QueryTypes.SELECT });
            if (!set) return res.status(404).json({ error: "Set not found." });
            set.questions = typeof set.questions === "string" ? JSON.parse(set.questions) : set.questions;
            return res.status(200).json(set);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
