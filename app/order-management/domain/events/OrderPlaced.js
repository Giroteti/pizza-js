const OrderManagementEvent = require('./OrderManagementEvent');
module.exports = class OrderPlacedEvent extends OrderManagementEvent {
    constructor(
        orderId,
        customerId,
        pizzeriaId,
        pizzaFlavor
    ) {
        super(orderId);
        this.customerId = customerId;
        this.pizzeriaId = pizzeriaId;
        this.pizzaFlavor = pizzaFlavor;
    }
}
