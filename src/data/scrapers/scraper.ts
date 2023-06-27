import { Stock } from "@models/stock";
export abstract class Scraper<T> {
    abstract scrape(): Promise<T[]>;
    abstract parseToStock(data: T): Promise<Stock>;
}
