import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run("CREATE TABLE stores (name TEXT UNIQUE)");
    db.run("INSERT INTO stores VALUES ('Pichau')");
    db.run("INSERT INTO stores VALUES ('Kabum')");
    db.run("INSERT INTO stores VALUES ('Terabyte')");

    db.run(
        "CREATE TABLE products (name TEXT UNIQUE, price REAL, url TEXT UNIQUE, store_id INTEGER NOT NULL, FOREIGN KEY (store_id) REFERENCES stores (rowid))"
    );
});

export default db;
