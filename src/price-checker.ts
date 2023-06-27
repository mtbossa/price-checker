import { findProductByName, insertProduct, updateProductByName } from "@data/db";
import { Product } from "@data/models/Product.model";

export type PriceCheckerResult = Awaited<ReturnType<typeof priceChecker>>;
export type PriceChanged = {
    product: Product;
    priceChange: {
        oldPrice: number;
        newPrice: number;
    };
};
export type NewProduct = {
    newProduct: Product;
};

export const priceChecker = async (scrapedProducts: Product[]) => {
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
                } as PriceChanged;
            }

            if (!foundProduct) {
                insertProduct(scrapedProduct, scrapedProduct.store_id);
                return {
                    newProduct: scrapedProduct,
                } as NewProduct;
            }

            return null;
        })
    );

    result = result.filter((product) => product);

    return result;
};
