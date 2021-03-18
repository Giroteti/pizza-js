interface InventorieDataObject {
    id: number
    pizzeriaId: number
    ingredientId: number
    quantity: number
}

export const inventoriesDataTable: InventorieDataObject[] = [
    {
        id: 1,
        pizzeriaId: 1, // Da Marco
        ingredientId: 1, // Dough
        quantity: 3
    },
    {
        id: 2,
        pizzeriaId: 1, // Da Marco
        ingredientId: 2, // Tomato sauce
        quantity: 10
    },
    {
        id: 3,
        pizzeriaId: 1, // Da Marco
        ingredientId: 3, // Mozzarella
        quantity: 10
    },
    {
        id: 4,
        pizzeriaId: 1, // Da Marco
        ingredientId: 10, // Basilico
        quantity: 10
    }
]
