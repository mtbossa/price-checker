import {
    clickButtonAndWaitForNavigation,
    clickButtonAndWaitForSelector,
    extractTextFromElement,
    newPage,
    waitForText,
} from "@helpers/bot";
import { Browser, ElementHandle, Page, PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { TimeoutError } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Spinner } from "cli-spinner";
import chalk from "chalk";

puppeteer.use(StealthPlugin());

export class PichauBuyerBot {
    constructor(
        private readonly browser: Browser,
        private readonly livePage: Page,
        private liveURL: string
    ) {}

    public async logIn() {
        console.log("Logging in...");

        const page = await this.browser.newPage();
        await page.goto("https://www.pichau.com.br");
    }

    private async checkForURL(urlPart: string) {
        let foundUrl = false;
        const linkSelector = `a[href*="${urlPart}"]`;

        const frameSelector = "#chatframe"; // Replace with the selector for the specific iframe
        const frameHandler = await this.livePage.waitForSelector(frameSelector);
        const frame = await frameHandler!.contentFrame();

        while (!foundUrl) {
            try {
                console.log("Trying to find URL with selector:", linkSelector);

                const linkHandler = (await frame!.waitForSelector(linkSelector, {
                    timeout: 2000,
                })) as ElementHandle<HTMLAnchorElement> | null;
                console.log("Link found!");

                const productUrl = await linkHandler!.evaluate((element) => element.href);

                console.log("URL found:", productUrl);

                foundUrl = true;
                // Perform your desired action with the link, such as clicking or processing it
                return productUrl; // Exit the loop if the link is found
            } catch (error) {
                if (error instanceof TimeoutError) {
                    // Selector not found within the timeout, handle as needed
                    console.log("Link not found, retrying...");
                } else {
                    // Other error occurred, handle as needed
                    console.log("Error occurred while trying to find link, retrying...");
                    console.error(error);
                }
            }
        }

        return null;
    }

    private async navigateToURL(page: Page, url: string) {
        const maxRetries = 5; // Maximum number of retries
        let retryCount = 0;

        while (retryCount < maxRetries) {
            console.log(`Trying to navigate to URL: ${url}). Attempt: ${retryCount}...`);
            try {
                await page.goto(url);
                console.log("Navigation successful");
                break; // Exit the loop if navigation is successful
            } catch (error) {
                console.log("Navigation error occurred, retrying...");
                retryCount++;
                await new Promise((r) => setTimeout(r, 3000));
            }
        }

        if (retryCount === maxRetries) {
            console.log("Maximum retries reached, unable to navigate to the page");
        }
    }

    private async buySteps(productPage: Page, productTitle?: string | null) {
        console.log("Start buying steps...");
        if (!productTitle) {
            productTitle = await this.getProductTitle(productPage);
        }
        await this.addToCart(productPage);

        if (productTitle) {
            await this.removeOtherProductsFromCart(productPage, productTitle);
        }

        await this.clickCheckout(productPage);
        await this.selectTransportation(productPage);
        await this.clickContinueToPayment(productPage);
        await this.selectPaymentMethod(productPage);
        await this.clickContinueToReview(productPage);
        await this.clickAcceptCheckBox(productPage);

        if (process.env.NODE_ENV === "dev") {
            console.log("[ DEV MODE ] BUY!");
        } else {
            await this.clickFinalize(productPage);
        }
    }

    public async searchSpecificURL() {
        console.log("Going to livestream...");
        await this.navigateToURL(this.livePage, this.liveURL);

        const urlsPartsToCheck = [
            "rx-7900-xt",
            "rx-7900-xtx",
            "rx7900xtx",
            "rx7900",
            "7900xtx",
            "7900",
        ];

        await Promise.all(
            urlsPartsToCheck.map(async (urlPart) => {
                const productUrl = await this.checkForURL(urlPart);

                if (!productUrl) {
                    console.error("Error while waiting for URL");
                } else {
                    const page = await newPage(this.browser);
                    await this.navigateToURL(page, productUrl);
                    await this.buySteps(page);
                    console.log("Done!");
                }
            })
        );
    }

    public async findURLAndOpenPages() {
        console.log("Going to livestream...");
        await this.navigateToURL(this.livePage, this.liveURL);

        await (async () => {
            const foundUrl = false;
            const linkSelector = `a[href*="pruuu"]`;

            const frameSelector = "#chatframe"; // Replace with the selector for the specific iframe
            const frameHandler = await this.livePage.waitForSelector(frameSelector);
            const frame = await frameHandler!.contentFrame();

            const alreadyFoundUrls: string[] = [];

            const PRODUCTS_TITLES_TO_LOOK_FOR = [
                "RX-7900-XT",
                "RX-7900-XTX",
                "RX7900XTX",
                "RX7900",
                "7900XTX",
                "7900",
            ];

            const spinner = new Spinner(
                `${chalk.blue.bold("%s")} Trying to find URL with selector ${chalk.green.bold(
                    linkSelector
                )}...`
            );
            spinner.setSpinnerString(19);
            spinner.start();

            while (!foundUrl) {
                try {
                    const links = await frame!.$$(linkSelector);

                    const shortnedLinks = await Promise.all(
                        links.map(async (link) => {
                            const textContent = await link.evaluate(
                                (element) => element.textContent ?? ""
                            );
                            return textContent;
                        })
                    );

                    const uniqueLinks = [...new Set(shortnedLinks)];
                    const linksToCheck = uniqueLinks
                        .map((link) => "https://" + link.split("https://")[1])
                        .filter((link) => !alreadyFoundUrls.includes(link));

                    alreadyFoundUrls.push(...linksToCheck);

                    for (const link of linksToCheck) {
                        spinner.stop();
                        console.log("\n");
                        const page = await newPage(this.browser);
                        await this.navigateToURL(page, link);

                        const pageURL = page.url();

                        if (PRODUCTS_TITLES_TO_LOOK_FOR.some((str) => pageURL.includes(str))) {
                            console.log("\nPRODUCT FOUND! URL:", pageURL);
                            await this.buySteps(page);
                            console.log("Done!");
                        } else {
                            console.log("\nProduct not found in page URL: ", pageURL);
                        }
                        await page.close();
                        spinner.start();
                    }

                    await new Promise((r) => setTimeout(r, 600));
                } catch (error) {
                    console.log("Error occurred while trying to find links, retrying...");
                    console.error(error);
                }
            }
        })();
    }

    private async selectTransportation(page: Page) {
        console.log("Selecting transportation...");
        const divTransports = await page.waitForSelector('div[aria-label="shipping_method"]');
        // select first input inside the divTransports
        // const firstRadio = await divTransports?.$('input[type="radio"]');
        const radios = await divTransports?.$$('input[type="radio"]');
        const firstRadioInput = radios![0];
        const isFirstSelected = await firstRadioInput.evaluate((radio) => radio.checked);

        if (!isFirstSelected) {
            await Promise.all([
                firstRadioInput.click(),
                page.waitForResponse("https://www.pichau.com.br/api/checkout"),
            ]);
            console.log("Transportation selected!");
        } else {
            console.log("Transportation already selected!");
        }
    }

    private async selectPaymentMethod(page: Page) {
        console.log("Selecting payment method...");
        const divMethods = await page.waitForSelector('div[aria-label="payment_method"]');
        console.log("Payment method div found!");
        const radios = await divMethods?.$$('input[type="radio"]');
        const secondRadio = radios![1];
        const isFirstSelected = await secondRadio.evaluate((radio) => radio.checked);

        if (!isFirstSelected) {
            await Promise.all([
                secondRadio.click(),
                page.waitForResponse("https://www.pichau.com.br/api/checkout"),
            ]);
            console.log("Payment method selected!");
        } else {
            console.log("Payment method already selected!");
        }
    }

    private async selectRowsWithoutText(tableSelector: string, searchText: string, page: Page) {
        await page.waitForSelector(`${tableSelector} tr`);
        const rowHandles = await page.$$(`${tableSelector} tbody tr`);

        const filteredRowHandles = await Promise.all(
            rowHandles.map(async (rowHandle) => {
                const hasText = await page.evaluate(
                    (row, searchText) => {
                        const descendants = Array.from(row.querySelectorAll("*"));
                        return descendants.every(
                            (element) => !(element as HTMLElement).innerText?.includes(searchText)
                        );
                    },
                    rowHandle,
                    searchText
                );
                if (hasText) {
                    return rowHandle;
                }
            })
        );

        const filteredRows = filteredRowHandles.filter(Boolean);

        return filteredRows;
    }

    private async removeOtherProductsFromCart(page: Page, productName: string) {
        console.log("Removing other products from cart...");
        const rows = await this.selectRowsWithoutText(
            'table[aria-label="cart list"]',
            productName,
            page
        );

        for (const [index, row] of rows.entries()) {
            console.log(`Removing product ${index + 1} of ${rows.length}...`);
            await this.processRow(row!, page);
            console.log(`Product ${index + 1} of ${rows.length} removed!`);
        }
    }

    async processRow(rowHandle: ElementHandle<HTMLTableRowElement>, page: Page) {
        const button = await rowHandle.$('button[aria-label="delete"]');
        await button?.click();

        await page.waitForResponse("https://www.pichau.com.br/api/checkout");
    }

    private async clickFinalize(page: Page) {
        console.log("Clicking Finalize...");
        const button = await page.waitForSelector('button[data-cy="finalize-order"]', {
            timeout: 0,
        });

        console.log("Finalize button found!");
        await button?.click();
        console.log("Finalize button clicked!");
    }

    private async clickAcceptCheckBox(page: Page) {
        console.log("Clicking Accept CheckBox...");
        const button = await page.waitForSelector('input[type="checkbox"]', {
            timeout: 0,
        });

        console.log("Accept CheckBox found!");
        await button?.click();
        console.log("Accept CheckBox clicked!");
    }

    private async clickContinueToReview(page: Page) {
        console.log("Clicking Continue to Review...");
        const button = await page.waitForSelector('button[data-cy="payment-continue-to-review"]', {
            timeout: 0,
        });

        await clickButtonAndWaitForSelector(page, button!, 'input[type="checkbox"]');
    }

    private async clickCheckout(page: Page) {
        console.log("Clicking Checkout...");
        const button = await page.waitForSelector('a[href="/checkout"]', {
            timeout: 0,
        });

        await clickButtonAndWaitForSelector(page, button!, 'div[aria-label="shipping_method"]');
    }

    private async clickContinueToPayment(page: Page) {
        console.log("Clicking Continue to Payment...");
        const button = await page.waitForSelector('button[data-cy="address-continue-to-payment"]', {
            timeout: 0,
        });

        await clickButtonAndWaitForSelector(page, button!, 'div[aria-label="payment_method"]');
    }

    private async addToCart(page: Page) {
        console.log("Adding to cart...");

        const button = await page.waitForSelector('div > button[data-cy="add-to-cart"]', {
            timeout: 0,
        });

        console.log("Waiting for text colocar no carrinho");
        await waitForText(page, "colocar no carrinho");
        console.log("Text found!");

        console.log("Clicking button...");
        await button?.click();
        console.log("Button clicked!");
    }

    private async getProductTitle(page: Page) {
        try {
            console.log("Trying to get product title...");
            const title = await page.waitForSelector('h1[data-cy="product-page-title"]', {
                timeout: 2000,
            });

            if (title) {
                const text = await extractTextFromElement(title);
                console.log("Product title found:", text);
                return text;
            } else {
                console.log("Could not get product title");
                return null;
            }
        } catch {
            console.log("Could not get product title");
            return null;
        }
    }
}
