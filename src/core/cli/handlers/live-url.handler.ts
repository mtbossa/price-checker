import prompts from "prompts";
import { PichauBuyerBot } from "@core/bot/pichau-buyer.bot";
import { liveURLPrompt, PromptName } from "../prompts/live-url";
import { buyMethodPrompt } from "../prompts/buy-method";
import { buyMethodHandler } from "./buy-method.handler";

export const liveURLHandler = async (answer: prompts.Answers<PromptName.Name>) => {
    const URL = answer[PromptName.Name] as string;
    const liveUrl =
        process.env.NODE_ENV === "dev" ? "https://www.youtube.com/watch?v=RuNa6XnDwn0" : URL;

    if (!liveUrl) {
        const response = await prompts(liveURLPrompt);

        await liveURLHandler(response);
        return;
    }

    const response = await prompts(buyMethodPrompt);

    await buyMethodHandler(response, liveUrl);
};
