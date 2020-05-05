const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../domain/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../domain/PaymentFailedEvent');

module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(
            pizzeriaRepository,
            customerRepository,
            menuRepository,
            pizzaRecipeRepository,
            ingredientInventoryRepository,
            paymentClient
        ) {
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
            this.menuRepository = menuRepository;
            this.pizzaRecipeRepository = pizzaRecipeRepository;
            this.ingredientInventoryRepository = ingredientInventoryRepository;
            this.paymentClient = paymentClient;
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

            const menu = this.menuRepository.getByPizzeriaId(command.pizzeriaId);
            const pizza = menu.find(p => p.flavor === command.pizzaFlavor);
            if (pizza == null) {
                return new PizzaNotOnTheMenuEvent();
            }

            const recipe = this.pizzaRecipeRepository.getByPizzaFlavorId(command.pizzaFlavor);
            const inventory = this.ingredientInventoryRepository.getByPizzeriaId(command.pizzeriaId);
            for (const i in recipe) {
                const ingredientToCheck = recipe[i];
                const ingredientInInventory = inventory.find(i => i.ingredientId === ingredientToCheck);
                if (ingredientInInventory == null || ingredientInInventory.quantity <= 0) {
                    return new NotEnoughIngredientsEvent();
                }
            }
            this.ingredientInventoryRepository.decrementIngredientsOfPizzeria(command.pizzeriaId, recipe);

            try {
                this.paymentClient.pay(customer.rib, pizzeria.rib, pizza.price);
            } catch (e) {
                return new PaymentFailedEvent();
            }

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
