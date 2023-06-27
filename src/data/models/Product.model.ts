export class Product {
    outOfStock: boolean;

    constructor(public name: string, public url: string, public price: number) {
        this.outOfStock = price === 0;
    }
}
