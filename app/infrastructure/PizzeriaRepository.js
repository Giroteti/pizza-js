const pizzerieDataTable = require('./tables/pizzerie');
const pizzeDataTable = require('./tables/pizze');
const inventoriesDataTable = require('./tables/inventories');
const ingredientsDataTable = require('./tables/ingredients');
const menusDataTable = require('./tables/menus');
const recipesDataTable = require('./tables/recipes');
const _ = require("lodash");
const {Pizzeria, Pizza, MenuItem, Ingredient, InventoryEntry, Inventory} = require('../domain/Pizzeria');

module.exports = class PizzeriaRepository {
    #pizzerieDataSource = _.cloneDeep(pizzerieDataTable);
    #pizzeDataSource = _.cloneDeep(pizzeDataTable);
    #menusDataSource = _.cloneDeep(menusDataTable);
    #recipesDataSource = _.cloneDeep(recipesDataTable);
    #inventoriesDataSource = _.cloneDeep(inventoriesDataTable);
    #ingredientsDataSource = _.cloneDeep(ingredientsDataTable);

    get(id) {
        const pizzeriaDTO = this.#pizzerieDataSource.find(p => p.id === id);
        if (pizzeriaDTO == null) {
            return null;
        }
        const menuEntryDTOs = this.#menusDataSource.filter(e => e.pizzeriaId === id);
        const pizzaIds = menuEntryDTOs.map(m => m.pizzaId);
        const pizzaDTOs = this.#pizzeDataSource.filter(p => pizzaIds.includes(p.id));
        const recipeDTOs = this.#recipesDataSource.filter(r => pizzaIds.includes(r.pizzaId));
        const inventoryEntryDTOs = this.#inventoriesDataSource.filter(e => e.pizzeriaId === id);
        const ingredientInPizzaIds = recipeDTOs.map(r => r.ingredientId);
        const ingredientInPizzaDTOs = this.#ingredientsDataSource.filter(i => ingredientInPizzaIds.includes(i.id));

        const pizze = this._parsePizze(pizzaDTOs, recipeDTOs, ingredientInPizzaDTOs);

        const menu = menuEntryDTOs.map(me => new MenuItem(
            pizze.find(p => p.id === me.pizzaId),
            me.price
        ))

        const inventory = new Inventory(inventoryEntryDTOs.map ( ie => new InventoryEntry(
            ie.ingredientId,
            ie.quantity
        )));

        return new Pizzeria(
            pizzeriaDTO.id,
            pizzeriaDTO.name,
            pizzeriaDTO.rib,
            menu,
            inventory
        )
    }

    _parsePizze(pizzaDTOs, recipeDTOs, ingredientInPizzaDTOs) {
        const ingredientsInPizza = ingredientInPizzaDTOs.map(i => new Ingredient(i.id, i.name));
        return pizzaDTOs.map(p => new Pizza(
            p.id,
            p.name,
            recipeDTOs.filter(r => r.pizzaId === p.id)
                .map(recipe => recipe.ingredientId)
                .map(ingredientId => ingredientsInPizza.find(ingredientsInPizze => ingredientsInPizze.id === ingredientId))
        ));
    }

    save(pizzeria) {
            pizzeria.getSnapshot().forEach(e => {
                const entryIndex = this.#inventoriesDataSource.findIndex(i => i.pizzeriaId === pizzeria.id && i.ingredientId === e.ingredientId);
                this.#inventoriesDataSource[entryIndex].quantity = e.quantity;
            }
        )
    }
}
