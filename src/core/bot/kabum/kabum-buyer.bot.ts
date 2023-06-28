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
import { storesIds } from "@data/db";

puppeteer.use(StealthPlugin());

export class KabumPriceCheckerBot extends Bot implements PriceChecker {
    private readonly PRODUCT_PAGE_SELECTOR = "div.productCard";

    productsPage: string;

    constructor(
        public readonly id: number,
        public readonly name: string,
        protected readonly browser: Browser,
        productsPage: string
    ) {
        super(id, name, browser);
        this.productsPage = productsPage;
    }

    async checkPagePrices(): Promise<Product[]> {
        this.logger.info("Checking page prices");

        const page = await newPage(this.browser);
        await navigateToURL(page, this.productsPage);

        await page.waitForSelector(this.PRODUCT_PAGE_SELECTOR);
        const products = await page.$$(this.PRODUCT_PAGE_SELECTOR);

        const productsData = await Promise.all(
            products.map(async (product) => {
                const url = await product.$eval("a", (el) => el.href);
                const title = await product.$eval("span.nameCard", (el) => el.textContent);
                const price = await product.$eval("span.priceCard", (el) => el.textContent);

                return new Product(title!, url, this.parsePrice(price!), storesIds["Kabum"]);
            })
        );

        await this.closeBrowser();

        return productsData;
    }

    private parsePrice(price: string): number {
        const parsed = parseFloat(price.replace(/[^0-9,-]/g, "").replace(",", "."));

        if (isNaN(parsed)) {
            return 0;
        }

        return parsed;
    }
}
