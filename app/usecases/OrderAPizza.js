const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/PizzaNotOnTheMenuEvent');
module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(
            pizzeriaRepository,
            customerRepository,
            menuRepository
        ) {
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
            this.menuRepository = menuRepository;
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
