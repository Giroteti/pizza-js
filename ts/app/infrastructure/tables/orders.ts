export interface OrderDataObject {
    id: number
    customerId: number
    pizzeriaId: number
    pizzaFlavor: number
    status: 1 | 2
}

export const ordersDataTable: OrderDataObject[] = [
    {
        id: 0, // Example
        customerId: 0,
        pizzeriaId: 0,
        pizzaFlavor: 0,
        status: 1 // FULFILLED
    }
]
