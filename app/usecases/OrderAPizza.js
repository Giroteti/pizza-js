const PizzaOrderedEvent = require('../domain/events/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/events/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/events/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/events/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../domain/events/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../domain/events/PaymentFailedEvent');
const { Order, OrderStatuses } = require('../domain/order');

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
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PizzeriaNotFoundEvent();
            }

            const customer = this.customerRepository.get(command.customerId);
            if (customer == null) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new CustomerNotFoundEvent();
            }

            if (!pizzeria.isPizzaOnTheMenu(command.pizzaFlavor)) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PizzaNotOnTheMenuEvent();
            }

            if (!pizzeria.hasEnoughIngredientsToCookPizza(command.pizzaFlavor)) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new NotEnoughIngredientsEvent();
            }

            const pizza = pizzeria.cookPizza(command.pizzaFlavor);
            this.pizzeriaRepository.save(pizzeria);

            try {
                this.paymentClient.pay(customer.iban, pizzeria.iban, pizza.price);
            } catch (e) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PaymentFailedEvent();
            }

            order.status = OrderStatuses.FULFILLED;
            this.orderRepository.save(order);
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
