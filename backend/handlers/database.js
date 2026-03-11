import { Sequelize } from "sequelize";
export default async () => {
    const dbName = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || "blacket";
    const dbUser = process.env.MYSQLUSER || "blacket";
    const dbPass = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || "password123";
    const dbHost = process.env.MYSQLHOST || "localhost";
    const dbPort = process.env.MYSQLPORT || 3306;
    global.database = new Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        port: dbPort,
        logging: global.config.verbose ? console.log : false,
        dialect: "mysql",
        dialectOptions: { ssl: { rejectUnauthorized: false } },
        pool: { max: 5, min: 0, acquire: 60000, idle: 10000 }
    });
    // Retry connection up to 5 times
    for (let i = 0; i < 5; i++) {
        try {
            await global.database.authenticate();
            console.log('[DB] Connected successfully.');
            break;
        } catch (err) {
            console.error(`[DB] Connection attempt ${i+1} failed:`, err.message);
            if (i < 4) await new Promise(r => setTimeout(r, 3000));
        }
    }
    try {
        const [columns] = await global.database.query("SHOW COLUMNS FROM users LIKE 'equipped_blook'");
        if (columns.length === 0) {
            await global.database.query("ALTER TABLE users ADD COLUMN equipped_blook VARCHAR(255) DEFAULT 'Default.png'");
        }
    } catch (err) {
        console.error('[DB] could not ensure equipped_blook column:', err.message || err);
    }
};
// cache bust Tue Mar 10 08:52:06 PM EDT 2026
