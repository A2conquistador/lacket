export default async (req, _, next) => {
    req.session = {};
    try {
        const session = await database.query('SELECT * FROM sessions WHERE token = ?', {
            replacements: [req.headers.authorization],
            type: database.QueryTypes.SELECT
        });
        if (session.length == 0) return next();
        req.session = { ...session[0], user: session[0].user_id };
    } catch (err) {
        console.error(err);
    }
    next();
}
