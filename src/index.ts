/* eslint @typescript-eslint/no-floating-promises: 0 */
import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import db, { findProductByName, insertProduct, updateProductByName } from "@data/db";
import { Product } from "@data/models/Product.model";

(async () => {
    print_program_name();

    const productsPageToCheck = [
        "https://www.pichau.com.br/hardware/placa-de-video?sort=price-desc&rgpu=6347,6658,7201,7202",
    ];

    const pichauBot = await makePichauBuyBot({
        botId: 0,
    });

    try {
        const products = await pichauBot.checkPagePrices(productsPageToCheck[0]);
        const result = await Promise.all(
            products.map(async (scrapedProduct) => {
                const foundProduct = await findProductByName(scrapedProduct.name);
                if (foundProduct && foundProduct.price !== scrapedProduct.price) {
                    console.log(
                        `Price of product ${scrapedProduct.name} changed from ${foundProduct.price} to ${scrapedProduct.price}!`
                    );
                    updateProductByName(scrapedProduct.name, scrapedProduct);

                    return {
                        product: scrapedProduct,
                        priceChange: {
                            oldPrice: foundProduct.price,
                            newPrice: scrapedProduct.price,
                        },
                    };
                } else {
                    insertProduct(scrapedProduct, scrapedProduct.store_id);
                    console.log(`New product found: ${scrapedProduct.name}!`);
                }
            })
        );
    } catch (e) {
        console.error(e);
    }
})();
