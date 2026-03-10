export default {
    method: 'GET',
    handler: async (req, res) => {
        try {
            const users = await database.query('SELECT id, username, tokens FROM users ORDER BY tokens DESC LIMIT 10', { type: database.QueryTypes.SELECT });
            res.status(200).json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
}