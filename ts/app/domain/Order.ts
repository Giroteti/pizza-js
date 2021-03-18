export class Order {
    public status: OrderStatuses | null = null

    constructor(
        public readonly id: number,
        public readonly customerId: number,
        public readonly pizzeriaId: number,
        public readonly pizzaFlavor: number
    ) {}
}

export const enum OrderStatuses {
    FULFILLED = 1,
    ON_ERROR = 2
}