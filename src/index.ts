/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";
import "module-alias/register";

import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";
import { sendEmail } from "./email";
import { priceChecker } from "./price-checker";
import { AvalilableStores, storesIds } from "@data/db";
import { Bot } from "@core/bot/bot";
import { PriceChecker } from "@core/bot/price-checker";
import { makeKabumBuyBot } from "@core/bot/kabum/kabum-bot.factory";
import { PichauPriceCheckerBot } from "@core/bot/pichau/pichau-buyer.bot";
import { KabumPriceCheckerBot } from "@core/bot/kabum/kabum-buyer.bot";

process.on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    // some other closing procedures go here
    process.exit(0);
});

(async () => {
    print_program_name();

    const availableStores: AvalilableStores[] = ["Kabum", "Pichau"];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const bots = await Promise.all(
                availableStores.map(async (store: AvalilableStores) => {
                    let bot: PichauPriceCheckerBot | KabumPriceCheckerBot;
                    if (store === "Pichau") {
                        bot = await makePichauBuyBot({
                            botId: 0,
                            productsUrl:
                                "https://www.pichau.com.br/hardware/placa-de-video?sort=price-desc&rgpu=6347,6658,7201,7202",
                        });
                    } else if (store === "Kabum") {
                        bot = await makeKabumBuyBot({
                            botId: 1,
                            productsUrl:
                                "https://www.kabum.com.br/hardware/placa-de-video-vga/placa-de-video-amd?page_number=1&page_size=20&facet_filters=eyJSYWRlb24gUlggU8OpcmllIDYwMDAiOlsiUlggNzkwMCBYVCIsIlJYIDc5MDAiLCJSWCA2OTUwIFhUIiwiUlggNjkwMCBYVCJdfQ==&sort=-price",
                        });
                    }
                    const products = await bot!.checkPagePrices();

                    const result = await priceChecker(products);
                    if (result.length > 0) {
                        await sendEmail(result, store);
                    }

                    return bot!;
                })
            );

            await awaitableTimeout(minutesToMilliseconds(randomNumber(8, 12)));
            bots.forEach((bot) => {
                bot.deleteDataDir();
            });
            await awaitableTimeout(5000);
        } catch (e) {
            console.error("An error occurred while checking prices: ", e);
            await awaitableTimeout(minutesToMilliseconds(randomNumber(1, 3)));
        }
    }
})();
