import fs from "fs";

export default () => global.config = JSON.parse(fs.readFileSync(new URL("../config.json", import.meta.url).pathname, "utf8"));
