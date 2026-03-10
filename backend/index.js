import "dotenv/config";
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import setupGame from './game/index.js';
import { setupChat } from './game/chat.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
process.start = Date.now();
app.use(express.static(path.join(__dirname, 'public')));
await (await import("./handlers/configuration.js")).default();
await (await import("./handlers/functions.js")).default();
await (await import("./handlers/database.js")).default();
await (await import("./handlers/middlewares.js")).default(app);
await (await import("./handlers/endpoints.js")).default(app);
await (await import("./handlers/frontend.js")).default(app);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const server = createServer(app);
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ server });
setupGame(wss);
setupChat(wss);
server.listen(global.config.port, () => {
    console.log('[SUCCESS] Blacket started on port ' + global.config.port);
});
