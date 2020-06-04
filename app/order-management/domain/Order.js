module.exports = {
    Order: class Order {
        #status;
        constructor(id, customerId, pizzeriaId, pizzaId) {
            if (id == null) {
                throw new Error("id should not be null");
            }
            this.id = id;
            this.customerId = customerId;
            this.pizzeriaId = pizzeriaId;
            this.pizzaFlavor = pizzaId;
            this.#status = OrderStatuses.PENDING;
        }

        static failed(id, customerId, pizzeriaId, pizzaId) {
            let order = new Order(id, customerId, pizzeriaId, pizzaId);
            order.fail();
            return order;
        }

        static fulfilled(id, customerId, pizzeriaId, pizzaId) {
            let order = new Order(id, customerId, pizzeriaId, pizzaId);
            order.fulfill();
            return order;
        }

        fulfill() {
            this.#status = OrderStatuses.FULFILLED;
        }

        fail() {
            this.#status = OrderStatuses.ON_ERROR;
        }

        isFulfilled() {
            return this.#status === OrderStatuses.FULFILLED;
        }
        getSnapshot() {
            return {
                id: this.id,
                customerId: this.customerId,
                pizzeriaId: this.pizzeriaId,
                pizzaId: this.pizzaFlavor,
                status: this.#status
            }
        }
    }
}
const OrderStatuses = {
    PENDING: 0,
    FULFILLED: 1,
    ON_ERROR: 2,
}
