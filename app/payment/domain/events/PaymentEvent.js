module.exports = class PaymentEvent {
    constructor(orderId) {
        if (new.target === PaymentEvent) {
            throw new TypeError("This class is abstract");
        }
        this.orderId = orderId;
    }
}
