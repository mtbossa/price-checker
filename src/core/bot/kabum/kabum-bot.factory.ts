import { PuppeteerLaunchOptions } from "puppeteer";
import { launchBrowser } from "@helpers/bot";
import { KabumPriceCheckerBot } from "./kabum-buyer.bot";
import { Bot } from "../bot";

export interface KabumBuyerBotConfig {
    botId: number;
    productsUrl: string;
}

export const makeKabumBuyBot = async (config: KabumBuyerBotConfig) => {
    const launchOptions = getLaunchOptions(config.botId);
    const browser = await launchBrowser(launchOptions);

    return new KabumPriceCheckerBot(config.botId, "KabumBOT", browser, config.productsUrl);
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
