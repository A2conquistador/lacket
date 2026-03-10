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
        dialectOptions: { socketPath: undefined },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });

    try {
        const [columns] = await global.database.query("SHOW COLUMNS FROM users LIKE 'equipped_blook'");
        if (columns.length === 0) {
            await global.database.query("ALTER TABLE users ADD COLUMN equipped_blook VARCHAR(255) DEFAULT 'Default.png'");
        }
    } catch (err) {
        console.error('[DB] could not ensure equipped_blook column:', err.message || err);
    }
};
