const inventoriesDataTable = require('./tables/inventories');
const _ = require("lodash");

module.exports = class IngredientInventoryRepository {
    #dataSource = _.cloneDeep(inventoriesDataTable);

    getByPizzeriaId(pizzeriaId) {
        return this.#dataSource
            .filter(i => i.pizzeriaId === pizzeriaId)
            .map(i => {
                return {
                    ingredientId: i.ingredientId,
                    quantity: i.quantity
                }
            });
    }

    decrementIngredientsOfPizzeria(pizzeriaId, ingredients) {
        for (const ingredientToDecrementIndex in ingredients) {
            const inventoryIndex = this.#dataSource
                .findIndex(i =>
                    i.pizzeriaId === pizzeriaId
                    && i.ingredientId === ingredients[ingredientToDecrementIndex]
                );
            this.#dataSource[inventoryIndex].quantity--;
        }
    }
}
