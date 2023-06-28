import { Product } from "@data/models/Product.model";

export interface PriceChecker {
    checkPagePrices: () => Promise<Product[]>;
    productsPage: string;
}
