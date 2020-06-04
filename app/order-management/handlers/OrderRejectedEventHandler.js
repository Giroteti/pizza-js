const OrderFailedEvent = require('../domain/events/OrderFailed');
module.exports = class OrderRejectedEventHandler {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    execute(orderRejectedEvent) {
        const order = this.orderRepository.get(orderRejectedEvent.orderId);
        order.fail();
        this.orderRepository.save(order);
        return new OrderFailedEvent(order.id);
    }
}
