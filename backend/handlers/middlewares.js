export default async (app) => {
    const files = Array.from(walk("./middlewares")).filter((file) => file.endsWith(".js"));

    // Ensure session middleware runs before others so req.session.user is available.
    files.sort((a, b) => {
        if (a.endsWith("sessions.js")) return -1;
        if (b.endsWith("sessions.js")) return 1;
        return a.localeCompare(b);
    });

    for (const file of files) {
        const middleware = (await import(`../${file}`)).default;
        app.use(middleware);
    }
};