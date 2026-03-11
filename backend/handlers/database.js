import { Sequelize } from "sequelize";
export default async () => {
    const dbName = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || "blacket";
    const dbUser = process.env.MYSQLUSER || "blacket";
    const dbPass = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || "password123";
    const dbHost = process.env.MYSQLHOST || "localhost";
    const dbPort = parseInt(process.env.MYSQLPORT || 3306);
    const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || null;

    let sequelizeOpts = {
        logging: global.config.verbose ? console.log : false,
        dialect: "mysql",
        dialectOptions: { ssl: false },
        pool: { max: 5, min: 0, acquire: 60000, idle: 10000 }
    };

    if (!dbUrl) {
        sequelizeOpts.host = dbHost;
        sequelizeOpts.port = dbPort;
    }

    global.database = dbUrl
        ? new Sequelize(dbUrl, sequelizeOpts)
        : new Sequelize(dbName, dbUser, dbPass, sequelizeOpts);

    for (let i = 0; i < 5; i++) {
        try {
            await global.database.authenticate();
            console.log("[DB] Connected successfully.");
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
        console.error("[DB] could not ensure equipped_blook column:", err.message || err);
    }
};
