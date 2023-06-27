import { PromptObject } from "prompts";
import { PromptName } from "./prompt-name";

export const buyURLPrompt: PromptObject<PromptName.Name> = {
    type: "text",
    name: PromptName.Name,
    message: `Digite a URL da live:`,
};
