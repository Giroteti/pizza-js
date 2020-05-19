module.exports = class OrderPreparationEvent {
    constructor(orderId) {
        if (new.target === OrderPreparationEvent) {
            throw new TypeError("This class is abstract");
        }
        this.orderId = orderId;
    }
}
