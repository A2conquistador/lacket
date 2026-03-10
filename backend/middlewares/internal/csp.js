export default (req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-eval' 'unsafe-inline' data: blob:");
    next();
}
