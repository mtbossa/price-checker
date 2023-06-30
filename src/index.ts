/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";
import "./utils/module-aliases";

import logger from "./logger";
import { print_program_name } from "./helpers/program_name";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";
import { makePriceChangeEmail, sendEmail } from "./email";
import { priceChecker } from "./price-checker";
import { AvalilableStores } from "@data/db";
import { PichauPriceCheckerBot, makePichauBot } from "@core/bot/pichau";
import { KabumPriceCheckerBot, makeKabumBot } from "@core/bot/kabum";
import { TerabytePriceCheckerBot, makeTerabyteBot } from "@core/bot/terabyte";

process.on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    // some other closing procedures go here
    process.exit(0);
});

const getBot = async (store: AvalilableStores, botId: number) => {
    switch (store) {
        case "Pichau":
            return makePichauBot({
                botId: botId,
                productsUrl:
                    "https://www.pichau.com.br/hardware/placa-de-video?sort=price-desc&rgpu=6347,6658,7201,7202",
            });
        case "Kabum":
            return makeKabumBot({
                botId: botId,
                productsUrl:
                    "https://www.kabum.com.br/hardware/placa-de-video-vga/placa-de-video-amd?page_number=1&page_size=20&facet_filters=eyJSYWRlb24gUlggU8OpcmllIDYwMDAiOlsiUlggNzkwMCBYVCIsIlJYIDc5MDAiLCJSWCA2OTUwIFhUIiwiUlggNjkwMCBYVCJdfQ==&sort=-price",
            });
        case "Terabyte":
            return makeTerabyteBot({
                botId: botId,
                productsUrl: "https://www.terabyteshop.com.br/hardware/placas-de-video/amd-radeon",
            });
        default:
            throw new Error("Invalid store");
    }
};

(async () => {
    print_program_name();

    const availableStores: AvalilableStores[] = ["Pichau", "Kabum", "Terabyte"];
    let errors = 0;
    const bots: (PichauPriceCheckerBot | KabumPriceCheckerBot | TerabytePriceCheckerBot)[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            logger.info("Checking prices...");

            for (const [index, store] of availableStores.entries()) {
                logger.info(`Checking ${store}...`);

                const bot = await getBot(store, index);
                const products = await bot.checkPagePrices();

                const result = await priceChecker(products);
                if (result.length > 0) {
                    logger.info("Found new results, sending email...");
                    const { html, subject } = makePriceChangeEmail(result, store);
                    await sendEmail(html, subject);
                }

                bots.push(bot);
            }

            const minutes = randomNumber(8, 12);
            logger.info(`Waiting ${minutes} minutes...`);
            await awaitableTimeout(minutesToMilliseconds(minutes));
        } catch (e) {
            errors++;

            logger.error("An error occurred while checking prices");
            console.error(e);

            const minutes = randomNumber(1, 3);

            if (errors >= 3) {
                sendEmail("Error occurred more then 3 times", "Error occurred");
                errors = 0;
            }

            logger.info(`Waiting ${minutes} minutes to try again...`);

            await awaitableTimeout(minutesToMilliseconds(minutes));
        } finally {
            bots.forEach((bot) => {
                bot.deleteDataDir();
            });
        }
    }
})();
