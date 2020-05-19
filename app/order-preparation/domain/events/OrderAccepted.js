const OrderPreparationEvent = require('./OrderPreparationEvent');

module.exports = class OrderAcceptedEvent extends OrderPreparationEvent {
    constructor(
        orderId,
        pizzeriaId,
        customerId,
        pizzaPrice
    ) {
        super(orderId);
        this.pizzeriaId = pizzeriaId;
        this.customerId = customerId;
        this.pizzaPrice = pizzaPrice;
    }

}
