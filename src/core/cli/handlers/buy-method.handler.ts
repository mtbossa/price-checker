import prompts from "prompts";
import { PromptName, Choices } from "../prompts/buy-method";
import { PichauBuyerBot } from "@core/bot/pichau-buyer.bot";
import { makePichauBuyBot } from "@core/bot/pichau-buyer-bot.factory";

export const buyMethodHandler = async (
    answer: prompts.Answers<PromptName.BuyMethod>,
    liveURL: string
) => {
    const bot = await makePichauBuyBot({
        botId: 0,
        liveURL,
    });

    switch (answer[PromptName.BuyMethod]) {
        case Choices.SpecificURL:
            try {
                await bot.searchSpecificURL();
            } catch (error) {
                console.error(error);
            }
            break;
        case Choices.AnyURL:
            try {
                await bot.findURLAndOpenPages();
            } catch (error) {
                console.error(error);
            }
            break;
        default:
            break;
    }
};
