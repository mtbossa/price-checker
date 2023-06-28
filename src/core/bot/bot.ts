import fs from "fs";
import path from "path";

import config from "@config";
import { Browser } from "puppeteer";

export abstract class Bot {
    constructor(public readonly id: number, protected readonly browser: Browser) {}

    deleteDataDir() {
        console.log(`Deleting data dir for bot ${this.id}`);
        fs.rmSync(Bot.getDataDir(this.id), { recursive: true, force: true });
    }

    static getDataDir(id: number) {
        const dataDirPath = path.join(config.dataDirPath, `bot-${id}`);
        return dataDirPath;
    }
}
