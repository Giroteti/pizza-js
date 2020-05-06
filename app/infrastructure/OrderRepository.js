const ordersDataTable = require('./tables/orders');
const _ = require("lodash");

module.exports = class OrderRepository {
    dataSource = _.cloneDeep(ordersDataTable);

    save(order) {
        this.dataSource.push(
            {
                id: order.id,
                customerId: order.customerId,
                pizzeriaId: order.pizzeriaId,
                pizzaFlavor: order.pizzaFlavor,
                status: order.status
            }
        );
    }
}
