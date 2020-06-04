const OrderPreparedEvent = require('../domain/events/OrderPrepared');

module.exports = class PaymentSucceededEventHandler {
    constructor(pizzeriaRepository, orderRepository) {
        this.pizzeriaRepository = pizzeriaRepository;
        this.orderRepository = orderRepository;
    }

    execute(paymentSucceededEvent) {
        const order = this.orderRepository.get(paymentSucceededEvent.orderId);
        const pizzeria = this.pizzeriaRepository.get(order.pizzeriaId);
        pizzeria.cookPizza(order.pizzaFlavor);
        this.pizzeriaRepository.save(pizzeria);
        return new OrderPreparedEvent(paymentSucceededEvent.orderId);
    }
}
