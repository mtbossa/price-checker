/* eslint @typescript-eslint/no-floating-promises: 0 */
import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";

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
        console.log(products);
    } catch (e) {
        console.error(e);
    }
})();
