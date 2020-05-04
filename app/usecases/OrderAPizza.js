const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
module.exports = {
    OrderAPizza: class OrderAPizza {
        execute(command) {
            return new PizzaOrderedEvent();
        }
    },
    OrderAPizzaCommand: class OrderAPizzaCommand{}
}
