import { PuppeteerLaunchOptions } from "puppeteer";
import { launchBrowser } from "@helpers/bot";
import { TerabytePriceCheckerBot } from "./terabyte-price-checker.bot";
import { Bot } from "../bot";

export interface TerabyteBuyerBotConfig {
    botId: number;
    productsUrl: string;
}

export const makeTerabyteBot = async (config: TerabyteBuyerBotConfig) => {
    const launchOptions = getLaunchOptions(config.botId);
    const browser = await launchBrowser(launchOptions);

    return new TerabytePriceCheckerBot(config.botId, "TerabyteBOT", browser, config.productsUrl);
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
