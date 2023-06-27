import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run("CREATE TABLE stores (name TEXT)");
    db.run("INSERT INTO stores VALUES ('Pichau')");
    db.run("INSERT INTO stores VALUES ('Kabum')");
    db.run("INSERT INTO stores VALUES ('Terabyte')");

    db.run("CREATE TABLE products (name TEXT, price REAL, url TEXT, store_id INTEGER)");
});

export default db;
