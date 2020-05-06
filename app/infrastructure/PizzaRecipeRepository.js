const recipesDataTable = require('./tables/recipes');
const _ = require("lodash");

module.exports = class PizzaRecipeRepository {
    #dataSource = _.cloneDeep(recipesDataTable);

    getByPizzaFlavorId(pizzaFlavorId) {
        return recipesDataTable
            .filter(r => r.pizzaId === pizzaFlavorId)
            .map(r => r.ingredientId);
    }
}
