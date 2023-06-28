import { PuppeteerLaunchOptions } from "puppeteer";
import { launchBrowser } from "@helpers/bot";
import { PichauPriceCheckerBot } from "./pichau-price-checker.bot";
import { Bot } from "../bot";

export interface PichauBuyerBotConfig {
    botId: number;
    productsUrl: string;
}

export const makePichauBot = async (config: PichauBuyerBotConfig) => {
    const launchOptions = getLaunchOptions(config.botId);
    const browser = await launchBrowser(launchOptions);

    return new PichauPriceCheckerBot(config.botId, "PichauBOT", browser, config.productsUrl);
};

const getLaunchOptions = (botId: number): PuppeteerLaunchOptions => {
    const args = ["--start-maximized"];
    if (process.env.NODE_ENV === "dev") {
        args.push("--auto-open-devtools-for-tabs");
    }

    return {
        headless: false,
        defaultViewport: null,
        userDataDir: Bot.getDataDir(botId),
        args,
    };
};
