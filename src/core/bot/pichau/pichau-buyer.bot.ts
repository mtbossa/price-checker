import {
    clickButtonAndWaitForNavigation,
    clickButtonAndWaitForSelector,
    extractTextFromElement,
    navigateToURL,
    newPage,
    waitForText,
} from "@helpers/bot";
import { Browser, ElementHandle, Page, PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { TimeoutError } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Spinner } from "cli-spinner";
import chalk from "chalk";
import { Bot } from "../bot";
import { PriceChecker } from "../price-checker";
import { Product } from "@data/models/Product.model";

puppeteer.use(StealthPlugin());

export class PichauPriceCheckerBot extends Bot implements PriceChecker {
    async checkPagePrices(pageUrl: string): Promise<Product[]> {
        const productsSelector = 'a[data-cy*="list-product"]';
        try {
            const page = await newPage(this.browser);
            await navigateToURL(page, pageUrl);

            await page.waitForSelector(productsSelector);
            const products = await page.$$(productsSelector);

            const productsData = await Promise.all(
                products.map(async (product) => {
                    const url = await page.evaluate((el) => el.href, product);
                    const title = await product.$("h2");
                    const name = await extractTextFromElement(title!);

                    const avistaSpan = await product.$("span ::-p-text(à vista)");
                    const avistaPrice =
                        (await page.evaluate((el) => el?.nextSibling?.textContent, avistaSpan)) ??
                        "0";

                    const avistaPriceNumber = parseFloat(
                        avistaPrice.replace(/[^0-9,-]/g, "").replace(",", ".")
                    );

                    return new Product(name!, url, avistaPriceNumber);
                })
            );

            return productsData;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}
