/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";

import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";
import { sendEmail } from "./email";
import { priceChecker } from "./price-checker";

(async () => {
    print_program_name();

    const productsPageToCheck = [
        "https://www.pichau.com.br/hardware/placa-de-video?sort=price-desc&rgpu=6347,6658,7201,7202",
    ];

    const pichauBot = await makePichauBuyBot({
        botId: 0,
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const products = await pichauBot.checkPagePrices(productsPageToCheck[0]);
            const result = await priceChecker(products);
            if (result.length > 0) {
                await sendEmail(result);
            }
            await awaitableTimeout(minutesToMilliseconds(randomNumber(8, 12)));
        } catch (e) {
            console.error("An error occurred while checking prices: ", e);
            await awaitableTimeout(minutesToMilliseconds(randomNumber(1, 3)));
        }
    }
})();
