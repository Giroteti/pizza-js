    module.exports = class OrderManagementEvent {
        constructor(orderId) {
            if (new.target === OrderManagementEvent) {
                throw new TypeError("This class is abstract");
            }
            this.orderId = orderId;
        }
    }
