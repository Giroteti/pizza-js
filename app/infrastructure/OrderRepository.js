const ordersDataTable = require('./tables/orders');
const _ = require("lodash");
const {Order} = require('../domain/order');

module.exports = class OrderRepository {
    dataSource = _.cloneDeep(ordersDataTable);

    save(order) {
        this.dataSource.push(
            order.getSnapshot()
        );
    }

    get(id) {
        const orderDTO = this.dataSource.find(o => o.id === id);
        if (orderDTO == null) {
            return null;
        } else if (orderDTO.status === 1) {
            return Order.fulfilled(
                orderDTO.id,
                orderDTO.customerId,
                orderDTO.pizzeriaId,
                orderDTO.pizzaId
            );
        } else {
            return Order.failed(
                orderDTO.id,
                orderDTO.customerId,
                orderDTO.pizzeriaId,
                orderDTO.pizzaId
            );
        }
    }
}


