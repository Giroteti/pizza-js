const OrderFailedEvent = require('../domain/events/OrderFailed');
module.exports = class PaymentFailedEventHandler {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    execute(paymentFailedEvent) {
        const order = this.orderRepository.get(paymentFailedEvent.orderId);
        order.fail();
        this.orderRepository.save(order);
        return new OrderFailedEvent(order.id);
    }
}
