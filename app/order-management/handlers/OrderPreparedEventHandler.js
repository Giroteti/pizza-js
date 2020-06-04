const OrderFulfilledEvent = require('../domain/events/OrderFulfilled');
module.exports = class OrderPreparedEventHandler {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    execute(orderPreparedEvent) {
        const order = this.orderRepository.get(orderPreparedEvent.orderId);
        order.fulfill();
        this.orderRepository.save(order);
        return new OrderFulfilledEvent(order.id);
    }
}
