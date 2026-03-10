export default {
    type: "post",
    run: async (req, res) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(401).json({ error: "Unauthorized." });
            const sessions = await database.query("SELECT * FROM sessions WHERE token = ?", { replacements: [token], type: database.QueryTypes.SELECT });
            if (!sessions.length) return res.status(401).json({ error: "Unauthorized." });
            const userId = sessions[0].user_id;
            const { title, description, questions } = req.body;
            if (!title) return res.status(400).json({ error: "Title is required." });
            if (!questions || !Array.isArray(questions) || questions.length < 1) return res.status(400).json({ error: "At least 1 question is required." });
            for (const q of questions) {
                if (!q.question || !q.answers || q.answers.length !== 4 || q.correct === undefined) return res.status(400).json({ error: "Each question needs a question, 4 answers, and a correct index." });
            }
            await database.query("INSERT INTO sets (user_id, title, description, questions) VALUES (?, ?, ?, ?)", { replacements: [userId, title, description || "", JSON.stringify(questions)] });
            const [set] = await database.query("SELECT * FROM sets WHERE user_id = ? ORDER BY id DESC LIMIT 1", { replacements: [userId], type: database.QueryTypes.SELECT });
            return res.status(200).json({ success: true, set });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};
