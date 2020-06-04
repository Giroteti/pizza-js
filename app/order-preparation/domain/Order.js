const _ = require("lodash");

module.exports = class Order {
    constructor(orderId, pizzeriaId, pizzaFlavor) {
        this.orderId = orderId;
        this.pizzeriaId = pizzeriaId;
        this.pizzaFlavor = pizzaFlavor;
    }
}
