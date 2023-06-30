import { PuppeteerLaunchOptions } from "puppeteer";
import { launchBrowser } from "@helpers/bot";
import { AvalilableStores } from "@root/data/db";
import { PichauPriceCheckerBot } from "./pichau";
import { TerabytePriceCheckerBot } from "./terabyte";
import { KabumPriceCheckerBot } from "./kabum";
import { Bot } from "./bot";

export interface BotConfig {
    botId: number;
    productsUrl: string;
}

export const makeBot = async (config: BotConfig, store: AvalilableStores) => {
    const launchOptions = getLaunchOptions(config.botId);
    const browser = await launchBrowser(launchOptions);

    switch (store) {
        case "Kabum":
            return new KabumPriceCheckerBot(config.botId, "KabumBOT", browser, config.productsUrl);
        case "Pichau":
            return new PichauPriceCheckerBot(
                config.botId,
                "PichauBOT",
                browser,
                config.productsUrl
            );
        case "Terabyte":
            return new TerabytePriceCheckerBot(
                config.botId,
                "TerabyteBOT",
                browser,
                config.productsUrl
            );
        default:
            throw new Error("Invalid store");
    }
};

const getLaunchOptions = (botId: number): PuppeteerLaunchOptions => {
    const args = ["--start-maximized"];
    if (process.env.NODE_ENV === "dev") {
        args.push("--auto-open-devtools-for-tabs");
    }

    return {
        headless: process.env.NODE_ENV !== "dev" ? "new" : false,
        defaultViewport: null,
        userDataDir: Bot.getDataDir(botId),
        args,
    };
};
