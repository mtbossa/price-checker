import sqlite3 from "sqlite3";
import { Product } from "./models/Product.model";

type AvalilableStores = "Pichau" | "Kabum" | "Terabyte";

const db = new sqlite3.Database("db.sqlite");

export const storesIds: Record<AvalilableStores, number> = {
    Pichau: 1,
    Kabum: 2,
    Terabyte: 3,
};

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS stores (name TEXT UNIQUE)");

    Object.entries(storesIds).forEach(([store, id]) => {
        db.run(`INSERT OR IGNORE INTO stores VALUES ('${store}')`);
    });

    db.run(
        "CREATE TABLE IF NOT EXISTS products (name TEXT UNIQUE, price REAL, url TEXT UNIQUE, store_id INTEGER NOT NULL, FOREIGN KEY (store_id) REFERENCES stores (rowid))"
    );
});

export const insertProduct = (product: Product, storeId: number) => {
    db.run("INSERT INTO products (name, price, url, store_id) VALUES (?, ?, ?, ?)", [
        product.name,
        product.price,
        product.url,
        storeId,
    ]);
};

export const updateProductByName = (name: string, newProductData: Product) => {
    db.run("UPDATE products SET price = ? WHERE name = ?", [newProductData.price, name], (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(
                `Updated product ${newProductData.name}. New price: ${newProductData.price}`
            );
        }
    });
};

export const findProductByName = (name: string) =>
    new Promise<Product | null>((resolve, reject) => {
        db.get<{
            name: string;
            price: number;
            url: string;
            store_id: number;
        } | null>("SELECT * FROM products WHERE name = ?", [name], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null);
            } else {
                resolve(new Product(row.name, row.url, row.price, row.store_id));
            }
        });
    });

export default db;
