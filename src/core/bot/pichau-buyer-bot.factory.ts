import { PuppeteerLaunchOptions } from "puppeteer";
import { PichauBuyerBot } from "./pichau-buyer.bot";
import { launchBrowser, newPage } from "@helpers/bot";

export interface PichauBuyerBotConfig {
    botId: number;
    liveURL: string;
}

export const makePichauBuyBot = async (config: PichauBuyerBotConfig) => {
    const launchOptions = getLaunchOptions(config.botId);
    const browser = await launchBrowser(launchOptions);
    const livePage = await newPage(browser);

    return new PichauBuyerBot(browser, livePage, config.liveURL);
};

const getLaunchOptions = (botId: number): PuppeteerLaunchOptions => {
    const args = ["--start-maximized"];
    if (process.env.NODE_ENV === "dev") {
        args.push("--auto-open-devtools-for-tabs");
    }

    return {
        headless: false,
        defaultViewport: null,
        userDataDir: `./tmp/user-data-${botId}`,
        args,
    };
};
