const OrderPreparationEvent = require('./OrderPreparationEvent');
module.exports = class OrderRejectedEvent extends OrderPreparationEvent {
    constructor(orderId) {
        super(orderId);
        if (new.target === OrderRejectedEvent) {
            throw new TypeError("This class is abstract");
        }
    }
}
