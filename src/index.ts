/* eslint @typescript-eslint/no-floating-promises: 0 */
import "dotenv/config";

import nodemailer from "nodemailer";
import { makePichauBuyBot } from "@core/bot/pichau/pichau-buyer-bot.factory";
import { print_program_name } from "./helpers/program_name";
import db, { findProductByName, insertProduct, updateProductByName } from "@data/db";
import { awaitableTimeout } from "@helpers/awaitable_timeout";
import { minutesToMilliseconds } from "@helpers/time";
import { randomNumber } from "@helpers/random";
import { Product } from "@data/models/Product.model";

type HandleProductsResult = Awaited<ReturnType<typeof handleProducts>>;

const sendEmail = async (result: HandleProductsResult) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const html = `
        <h1>Price Change</h1>
            <ul>
                ${result
                    .map((product) => {
                        if ("priceChange" in product!) {
                            return `<li>Product: ${product.product!.name} - Old Price: ${
                                product.priceChange!.oldPrice
                            } - New Price: ${product.priceChange!.newPrice} - URL: ${
                                product.product!.url
                            }</li>`;
                        }
                    })
                    .join("")}
            </ul>
            <h1>New Products</h1>
            <ul>
                ${result
                    .map((product) => {
                        if ("newProduct" in product!) {
                            return `<li>Product: ${product.newProduct!.name} - Price: ${
                                product.newProduct!.price
                            } - URL: ${product.newProduct!.url}</li>`;
                        }
                    })
                    .join("")}
            </ul>`;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "mateus.rbossa@gmail.com",
        subject: "Pichau Bot - Price Change",
        html: html,
    });
};

const handleProducts = async (scrapedProducts: Product[]) => {
    let result = await Promise.all(
        scrapedProducts.map(async (scrapedProduct) => {
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

            return null;
        })
    );

    result = result.filter((product) => product !== null);

    return result;
};

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
            const result = await handleProducts(products);
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
