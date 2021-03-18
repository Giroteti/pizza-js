import { inventoriesDataTable } from './tables/inventories'
import { PizzaDataObject } from './tables/pizze'
import * as _ from 'lodash'

export class IngredientInventoryRepository {
    private dataSource = _.cloneDeep(inventoriesDataTable);

    getByPizzeriaId(pizzeriaId: number): PizzaDataObject {
        return this.dataSource
            .filter(i => i.pizzeriaId === pizzeriaId)
            .map(i => {
                return {
                    ingredientId: i.ingredientId,
                    quantity: i.quantity
                }
            });
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
