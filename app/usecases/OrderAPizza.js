const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../domain/NotEnoughIngredientsEvent');

module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(
            pizzeriaRepository,
            customerRepository,
            menuRepository,
            pizzaRecipeRepository,
            ingredientInventoryRepository
        ) {
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
            this.menuRepository = menuRepository;
            this.pizzaRecipeRepository = pizzaRecipeRepository;
            this.ingredientInventoryRepository = ingredientInventoryRepository;
        }
        execute(command) {
            const pizzeria = this.pizzeriaRepository.get(command.pizzeriaId);
            if (pizzeria == null) {
                return new PizzeriaNotFoundEvent();
            }

            const customer = this.customerRepository.get(command.customerId);
            if (customer == null) {
                return new CustomerNotFoundEvent();
            }

            const menu = this.menuRepository.getByPizzeriaId(command.pizzeriaId)
            if (!menu.includes(command.pizzaFlavor)) {
                return new PizzaNotOnTheMenuEvent();
            }

            const recipe = this.pizzaRecipeRepository.getByPizzaFlavorId(command.pizzaFlavor);
            const inventory = this.ingredientInventoryRepository.getByPizzeriaId(command.pizzeriaId);
            for (const i in recipe) {
                const ingredientInventory = inventory[recipe[i]];
                if (ingredientInventory == null || ingredientInventory <= 0) {
                    return new NotEnoughIngredientsEvent();
                }
                inventory[recipe[i]]--;
            }
            this.ingredientInventoryRepository.updateByPizzeriaId(command.pizzeriaId, inventory);



            return new PizzaOrderedEvent();
        }
    },
    OrderAPizzaCommand: class OrderAPizzaCommand{
        constructor(pizzeriaId, customerId, pizzaFlavor) {
            this.pizzeriaId = pizzeriaId;
            this.customerId = customerId;
            this.pizzaFlavor = pizzaFlavor;
        }
    }
}
