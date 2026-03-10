import { Sequelize } from "sequelize";

export default async () => {
    global.database = new Sequelize("blacket", "blacket", "password123", {
        host: "localhost",
        logging: global.config.verbose ? console.log : false,
        dialect: "mysql"
    });

    // Ensure the users table has an equipped_blook column (used to store which blook the user has equipped).
    try {
        const [columns] = await global.database.query("SHOW COLUMNS FROM users LIKE 'equipped_blook'");
        if (columns.length === 0) {
            await global.database.query("ALTER TABLE users ADD COLUMN equipped_blook VARCHAR(255) DEFAULT 'Default.png'");
        }
    } catch (err) {
        // Do not crash if the schema isn't set up yet (e.g. fresh install without users table).
        console.error('[DB] could not ensure equipped_blook column:', err.message || err);
    }
};
