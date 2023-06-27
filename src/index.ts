/* eslint @typescript-eslint/no-floating-promises: 0 */
import prompts from "prompts";

import { buyURLHandler } from "./core/cli/handlers/buy-url.handler";
import { print_program_name } from "./helpers/program_name";
import { buyMethodPrompt } from "@core/cli/prompts/buy-method";
import { buyMethodHandler } from "@core/cli/handlers/buy-method.handler";
import { liveURLPrompt } from "@core/cli/prompts/live-url";
import { liveURLHandler } from "@core/cli/handlers/live-url.handler";

(async () => {
    print_program_name();

    const response = await prompts(liveURLPrompt);

    liveURLHandler(response);
})();
