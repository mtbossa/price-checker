import prompts from "prompts";
import { PromptName } from "../prompts/buy-url/prompt-name";
import { PichauBuyerBot } from "@core/bot/pichau-buyer.bot";
import { buyURLPrompt } from "../prompts/buy-url";

export const buyURLHandler = async (answer: prompts.Answers<PromptName.Name>) => {
    const URL = answer[PromptName.Name] as string;
    const liveUrl =
        process.env.NODE_ENV === "dev" ? "https://www.youtube.com/watch?v=JdqOa23-EpM" : URL;
    const productUrl =
        process.env.NODE_ENV === "dev"
            ? "https://www.pichau.com.br/mesa-gamer-mancer-wicca-z-rgb-preto-mcr-wccz-bk01"
            : URL;

    if (!liveUrl) {
        const response = await prompts(buyURLPrompt);

        await buyURLHandler(response);
        return;
    }

    const buyer = new PichauBuyerBot(0, liveUrl, productUrl);

    try {
        await buyer.launchBrowser();
        await buyer.buyThroughLive();
    } catch (error) {
        console.error(error);
    }
};
