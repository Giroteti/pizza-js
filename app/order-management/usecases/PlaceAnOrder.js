const {Order} = require('../domain/Order');
const OrderPlacedEvent = require('../domain/events/OrderPlaced')
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFound')
const CustomerNotFoundEvent = require('../domain/events/CustomerNotFound')

module.exports = {
    PlaceAnOrder: class PlaceAnOrder {
        constructor(
            idGenerator,
            orderRepository,
            pizzeriaRepository,
            customerRepository
        ) {
            this.idGenerator = idGenerator;
            this.orderRepository = orderRepository;
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
        }

        execute(command) {
            const order = new Order(
                this.idGenerator.next(),
                command.customerId,
                command.pizzeriaId,
                command.pizzaFlavor
            );

            let event;
            const pizzeria = this.pizzeriaRepository.get(command.pizzeriaId);
            if (pizzeria == null) {
                order.fail();
                event = new PizzeriaNotFoundEvent(order.id);
            } else {
                const customer = this.customerRepository.get(command.customerId);
                if (customer == null) {
                    order.fail();
                    event = new CustomerNotFoundEvent(order.id);
                } else {
                    event = new OrderPlacedEvent(
                        order.id,
                        customer.id,
                        pizzeria.id,
                        command.pizzaFlavor
                    )
                }
            }
            this.orderRepository.save(order);
            return event;
        }
    },
    PlaceAnOrderCommand: class PlaceAnOrderCommand{
        constructor(pizzeriaId, customerId, pizzaFlavor) {
            this.pizzeriaId = pizzeriaId;
            this.customerId = customerId;
            this.pizzaFlavor = pizzaFlavor;
        }
    }
}
