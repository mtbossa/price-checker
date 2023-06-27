import { Stock } from "@data/models/stock";

export abstract class Parser<T> {
    abstract parse(from: T): Stock;
}
