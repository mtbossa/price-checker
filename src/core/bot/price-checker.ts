import { Product } from "@data/models/Product.model";

export interface PriceChecker {
    checkPagePrices: (url: string) => Promise<Product[]>;
}
