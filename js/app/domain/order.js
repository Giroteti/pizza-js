module.exports = {
    Order: class Order {
        status = null
        constructor(id, customerId, pizzeriaId, pizzaFlavor) {
            this.id = id;
            this.customerId = customerId;
            this.pizzeriaId = pizzeriaId;
            this.pizzaFlavor = pizzaFlavor;
        }
    },
    OrderStatuses: {
        FULFILLED: 1,
        ON_ERROR: 2,
    }
}
