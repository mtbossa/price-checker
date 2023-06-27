export class Product {
    outOfStock: boolean;

    constructor(
        public name: string,
        public url: string,
        public price: number,
        public store_id: number
    ) {
        this.outOfStock = price === 0;
    }
}
