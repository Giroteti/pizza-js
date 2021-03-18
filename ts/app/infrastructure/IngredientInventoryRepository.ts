import { inventoriesDataTable } from './tables/inventories'
import * as _ from 'lodash'

interface IngredientInventoryDataObject {
    ingredientId: number;
    quantity: number
}

export class IngredientInventoryRepository {
    private dataSource = _.cloneDeep(inventoriesDataTable);

    getByPizzeriaId(pizzeriaId: number): IngredientInventoryDataObject[] {
        return this.dataSource
            .filter(i => i.pizzeriaId === pizzeriaId)
            .map(i => ({
                ingredientId: i.ingredientId,
                quantity: i.quantity
            }));
    }

    decrementIngredientsOfPizzeria(pizzeriaId: number, ingredients: any): void {
        for (const ingredientToDecrementIndex in ingredients) {
            const inventoryIndex = this.dataSource
                .findIndex(i =>
                    i.pizzeriaId === pizzeriaId
                    && i.ingredientId === ingredients[ingredientToDecrementIndex]
                );
            this.dataSource[inventoryIndex].quantity--;
        }
    }
}
