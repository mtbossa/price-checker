import { PromptObject } from "prompts";
import { PromptName } from "./prompt-name";
import { Choices } from "./choices.enum";

export const buyMethodPrompt: PromptObject<PromptName.BuyMethod> = {
    type: "select",
    name: PromptName.BuyMethod,
    message: `Selecione o método de compra`,
    choices: [
        { title: "URL específica", value: Choices.SpecificURL },
        { title: "Qualquer URL", value: Choices.AnyURL },
    ],
};
