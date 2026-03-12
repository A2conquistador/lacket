export default async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) return next();
        const user = await database.query(`SELECT * FROM users WHERE id = ?`, {
            replacements: [req.session.user],
            type: database.QueryTypes.SELECT
        });
        if (user.length == 0) return next();
        req.user = user[0];
        if (req.user.banned && req.path.startsWith("/api")) {
            return res.status(403).json({ error: "Your account has been banned." });
        }
        next();
    } catch (err) {
        console.error("[USER MIDDLEWARE ERROR]", err.message);
        next();
    }
}
