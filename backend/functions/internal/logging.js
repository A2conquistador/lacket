import chalk from "chalk";
const console = global.console;
export default global.console = {
    log: (...args) => console.log(...args),
    info: (...args) => console.log(chalk.blue("[INFO] "), ...args),
    notice: (...args) => console.log(chalk.yellow("[NOTICE] "), ...args),
    warn: (...args) => console.log(chalk.yellow("[WARN] "), ...args),
    error: (...args) => console.log(chalk.red("[ERROR] "), ...args),
    success: (...args) => console.log(chalk.green("[SUCCESS] "), ...args),
    debug: (...args) => console.log(chalk.magenta("[DEBUG] "), ...args),
}
