export interface MenuDataObject {
    id: number
    pizzeriaId: number
    pizzaId: number
    price: number
}

export const menusDataTable: MenuDataObject[] = [
    {
        id: 1,
        pizzeriaId: 1, // Da Marco
        pizzaId: 1, // Margherita
        price: 10
    },
    {
        id: 2,
        pizzeriaId: 1, // Da Marco
        pizzaId: 2, // Quattro formaggi
        price: 12
    }
]
