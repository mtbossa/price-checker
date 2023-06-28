import fs from "fs";
import path from "path";
import { Browser } from "puppeteer";
import { Logger } from "pino";

import config from "@config";
import logger from "@root/logger";

export abstract class Bot {
    protected readonly logger: Logger;
    constructor(
        public readonly id: number,
        public readonly name: string,
        protected readonly browser: Browser
    ) {
        this.logger = logger.child({ botName: name, botId: id });
    }

    deleteDataDir() {
        this.logger.info("Deleting bot data dir");
        fs.rmSync(Bot.getDataDir(this.id), { recursive: true, force: true });
    }

    static getDataDir(id: number) {
        const dataDirPath = path.join(config.dataDirPath, `bot-${id}`);
        return dataDirPath;
    }
}
