const PizzaOrderedEvent = require('../domain/events/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/events/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/events/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/events/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../domain/events/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../domain/events/PaymentFailedEvent');
const { Order } = require('../domain/order');

module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(
            idGenerator,
            orderRepository,
            pizzeriaRepository,
            customerRepository,
            paymentClient,
        ) {
            this.idGenerator = idGenerator;
            this.orderRepository = orderRepository;
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
            this.paymentClient = paymentClient;
        }
        execute(command) {
            const order = new Order(
                this.idGenerator.next(),
                command.customerId,
                command.pizzeriaId,
                command.pizzaFlavor
            );

            const pizzeria = this.pizzeriaRepository.get(command.pizzeriaId);
            if (pizzeria == null) {
                order.fail();
                this.orderRepository.save(order);
                return new PizzeriaNotFoundEvent();
            }

            const customer = this.customerRepository.get(command.customerId);
            if (customer == null) {
                order.fail();
                this.orderRepository.save(order);
                return new CustomerNotFoundEvent();
            }

            if (!pizzeria.isPizzaOnTheMenu(command.pizzaFlavor)) {
                order.fail();
                this.orderRepository.save(order);
                return new PizzaNotOnTheMenuEvent();
            }

            if (!pizzeria.hasEnoughIngredientsToCookPizza(command.pizzaFlavor)) {
                order.fail();
                this.orderRepository.save(order);
                return new NotEnoughIngredientsEvent();
            }

            try {
                this.paymentClient.pay(customer.iban, pizzeria.iban, pizzeria.getPizzaPrice(command.pizzaFlavor));
                pizzeria.cookPizza(command.pizzaFlavor);
                order.fulfill();
                this.orderRepository.save(order);
                this.pizzeriaRepository.save(pizzeria);
                return new PizzaOrderedEvent();
            } catch (e) {
                order.fail();
                this.orderRepository.save(order);
                return new PaymentFailedEvent();
            }
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
