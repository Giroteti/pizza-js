const ordersDataTable = require('../../shared-kernel/infrastructure/tables/orders');
const _ = require("lodash");
const {Order} = require('../domain/Order');

module.exports = class OrderRepository {
    dataSource = _.cloneDeep(ordersDataTable);

    save(order) {
        let orderIndex = this.dataSource.findIndex(o => o.id == order.id);
        if (orderIndex === -1) {
            orderIndex = 0;
        }
        this.dataSource[orderIndex] = order.getSnapshot()
    }

    get(id) {
        const orderDTO = this.dataSource.find(o => o.id === id);
        if (orderDTO == null) {
            return null;
        } else if (orderDTO.status === 0) {
            return new Order(
                orderDTO.id,
                orderDTO.customerId,
                orderDTO.pizzeriaId,
                orderDTO.pizzaId
            );
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


