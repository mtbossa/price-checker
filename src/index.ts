/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";
import "./utils/module-aliases";

import logger from "./logger";
import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";
import { sendEmail } from "./email";
import { priceChecker } from "./price-checker";
import { AvalilableStores } from "@data/db";
import { makeKabumBuyBot } from "@core/bot/kabum/kabum-bot.factory";
import { PichauPriceCheckerBot } from "@core/bot/pichau/pichau-buyer.bot";
import { KabumPriceCheckerBot } from "@core/bot/kabum/kabum-buyer.bot";
import {
    TerabyteBuyerBotConfig,
    makeTerabyteBuyBot,
} from "./core/bot/terabyte/terabyte-bot.factory";
import { TerabytePriceCheckerBot } from "./core/bot/terabyte/terabyte-buyer.bot";

process.on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    // some other closing procedures go here
    process.exit(0);
});

(async () => {
    print_program_name();

    const availableStores: AvalilableStores[] = ["Pichau", "Kabum", "Terabyte"];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            logger.info("Checking prices...");
            const bots = await Promise.all(
                availableStores.map(async (store: AvalilableStores, index: number) => {
                    let bot: PichauPriceCheckerBot | KabumPriceCheckerBot | TerabytePriceCheckerBot;
                    if (store === "Pichau") {
                        bot = await makePichauBuyBot({
                            botId: index,
                            productsUrl:
                                "https://www.pichau.com.br/hardware/placa-de-video?sort=price-desc&rgpu=6347,6658,7201,7202",
                        });
                    } else if (store === "Kabum") {
                        bot = await makeKabumBuyBot({
                            botId: index,
                            productsUrl:
                                "https://www.kabum.com.br/hardware/placa-de-video-vga/placa-de-video-amd?page_number=1&page_size=20&facet_filters=eyJSYWRlb24gUlggU8OpcmllIDYwMDAiOlsiUlggNzkwMCBYVCIsIlJYIDc5MDAiLCJSWCA2OTUwIFhUIiwiUlggNjkwMCBYVCJdfQ==&sort=-price",
                        });
                    } else if (store === "Terabyte") {
                        bot = await makeTerabyteBuyBot({
                            botId: index,
                            productsUrl:
                                "https://www.terabyteshop.com.br/hardware/placas-de-video/amd-radeon",
                        });
                    }
                    const products = await bot!.checkPagePrices();

                    const result = await priceChecker(products);
                    if (result.length > 0) {
                        logger.info("Found new results, sending email...");
                        await sendEmail(result, store);
                    }

                    return bot!;
                })
            );

            const minutes = randomNumber(8, 12);
            logger.info(`Waiting ${minutes}min...`);
            await awaitableTimeout(minutesToMilliseconds(minutes));
            bots.forEach((bot) => {
                bot.deleteDataDir();
            });
            await awaitableTimeout(2000);
        } catch (e) {
            logger.error("An error occurred while checking prices: ", e);
            const minutes = randomNumber(1, 3);
            logger.info(`Waiting ${minutes}min to try again...`);
            await awaitableTimeout(minutesToMilliseconds(minutes));
        }
    }
})();
