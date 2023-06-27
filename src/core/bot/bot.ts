import fs from "fs";
import path from "path";

import config from "@config";
import { Browser } from "puppeteer";

export abstract class Bot {
    constructor(protected readonly id: number, protected readonly browser: Browser) {}

    protected deleteDataDir() {
        fs.rmSync(Bot.getDataDir(this.id), { recursive: true, force: true });
    }

    static getDataDir(id: number) {
        const dataDirPath = path.join(config.dataDirPath, `bot-${id}`);
        return dataDirPath;
    }
}
