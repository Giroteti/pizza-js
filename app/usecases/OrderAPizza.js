const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFoundEvent');
module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(pizzeriaRepository) {
            this.pizzeriaRepository = pizzeriaRepository;
        }
        execute(command) {
            const pizzeria = this.pizzeriaRepository.get(command.pizzeriaId);
            if (pizzeria == null) {
                return new PizzeriaNotFoundEvent();
            }
            return new PizzaOrderedEvent();
        }
    },
    OrderAPizzaCommand: class OrderAPizzaCommand{
        constructor(pizzeriaId) {
            this.pizzeriaId = pizzeriaId;
        }
    }
}
