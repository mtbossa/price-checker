/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";
import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import db, { findProductByName, insertProduct, updateProductByName } from "@data/db";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";

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
            const result = await Promise.all(
                products.map(async (scrapedProduct) => {
                    const foundProduct = await findProductByName(scrapedProduct.name);
                    if (foundProduct && foundProduct.price !== scrapedProduct.price) {
                        updateProductByName(scrapedProduct.name, scrapedProduct);

                        return {
                            product: scrapedProduct,
                            priceChange: {
                                oldPrice: foundProduct.price,
                                newPrice: scrapedProduct.price,
                            },
                        };
                    }

                    if (!foundProduct) {
                        insertProduct(scrapedProduct, scrapedProduct.store_id);
                        return {
                            newProduct: scrapedProduct,
                        };
                    }
                })
            );

            await awaitableTimeout(minutesToMilliseconds(randomNumber(8, 12)));
        } catch (e) {
            console.error("An error occurred while checking prices: ", e);
        }
    }
})();
