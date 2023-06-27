import { Browser, ElementHandle, Page, PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export const waitForText = async (page: Page, text: string, timeout = 0) => {
    await page.waitForFunction(
        (text) => {
            const element = document.querySelector("body");
            if (element) {
                const regex = new RegExp(text, "i");
                return regex.test(element.innerText);
            }
            return false;
        },
        { timeout },
        text
    );
};

export const extractTextFromElement = async <T extends Node>(element: ElementHandle<T>) => {
    const value = await element.evaluate((el) => el.textContent);
    return value;
};

export const clickButtonAndWaitForNavigation = async <T extends HTMLElement>(
    page: Page,
    button: ElementHandle<T>
) => {
    return new Promise<boolean>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const interval = setInterval(async () => {
            try {
                await Promise.all([
                    page.waitForNavigation(), // Wait for navigation to complete
                    button.click(),
                ]);
                clearInterval(interval);
                resolve(true);
            } catch (error) {
                // Handle any errors during click or navigation
                // You can customize the error handling as needed
                // For example, you can reject the promise and handle the error in the calling code
            }
        }, 1000); // Adjust the interval duration as needed
    });
};

export const clickButtonAndWaitForSelector = async <T extends HTMLElement>(
    page: Page,
    button: ElementHandle<T>,
    selector: string
) => {
    let selectorFound = false;
    while (!selectorFound) {
        try {
            await button.scrollIntoView();
            console.log("Clicking button...");
            await button.click();
            console.log("Button clicked, waiting for selector: ", selector);
            await page.waitForSelector(selector, { timeout: 500 });
            console.log(`Selector ${selector} found!`);
            selectorFound = true;
        } catch (error) {
            // Handle any errors during click or navigation
            // You can customize the error handling as needed
            // For example, you can reject the promise and handle the error in the calling code
        }
    }
};

export const newPage = async (browser: Browser) => {
    console.log("Opening new page...");
    const newPage = await browser.newPage();
    console.log("Page opened!");
    return newPage;
};

export const launchBrowser = async (options: PuppeteerLaunchOptions) => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch(options);
    console.log("Browser launched!");
    return browser;
};

export const navigateToURL = async (page: Page, url: string) => {
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
};
