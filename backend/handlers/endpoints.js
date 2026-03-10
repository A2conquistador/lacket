export default async (app) => {
    for (const file of walk(new URL("../endpoints", import.meta.url).pathname)) {
        if (!file.endsWith(".js")) continue;
        let endpoint; try { endpoint = (await import(file)).default; } catch(e) { console.error('[IMPORT ERROR]', file, e.message); continue; }
        if (!endpoint) { console.error('[NO DEFAULT]', file); continue; }
        const path = "/" + file.replace("endpoints", "api").slice(0, -3);
        const method = (endpoint.method || endpoint.type || "get").toLowerCase();
        const handler = endpoint.handler || endpoint.run;
        if (!handler) continue;
        app[method](path, async (req, res) => {
            try {
                if (endpoint.disabled) return res.status(501).json("disabled");
                if (endpoint.schema) {
                    for (const [key, value] of Object.entries(endpoint.schema)) {
                        if (value.required && req.body[key] === undefined) return res.status(400).json(key + " missing");
                        if (value.type && req.body[key] !== undefined && typeof req.body[key] !== value.type) return res.status(400).json(key + " wrong type");
                    }
                }
                await handler(req, res);
            } catch (err) {
                console.error("[ENDPOINT ERROR]", path, err.message);
                if (!res.headersSent) res.status(500).json({ error: "Internal server error." });
            }
        });
    }
    app.get("/api", (_, res) => res.json({ ok: true }));
};
