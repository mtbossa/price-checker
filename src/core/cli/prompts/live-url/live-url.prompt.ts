import { PromptObject } from "prompts";
import { PromptName } from "./prompt-name";

export const liveURLPrompt: PromptObject<PromptName.Name> = {
    type: "text",
    name: PromptName.Name,
    message: `Digite a URL da live:`,
};
