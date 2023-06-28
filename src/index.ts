/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";

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

(async () => {
    print_program_name();

    const bots: AvalilableStores[] = ["Kabum", "Pichau"];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await Promise.all(
                bots.map(async (store: AvalilableStores) => {
                    let bot: PriceChecker;
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
                })
            );

            await awaitableTimeout(minutesToMilliseconds(randomNumber(8, 12)));
        } catch (e) {
            console.error("An error occurred while checking prices: ", e);
            await awaitableTimeout(minutesToMilliseconds(randomNumber(1, 3)));
        }
    }
})();
