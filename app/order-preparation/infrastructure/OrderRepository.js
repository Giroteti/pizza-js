const _ = require("lodash");
const Order = require('../domain/Order');
module.exports = class OrderRepository {
    dataSource = [];

    save(order) {
        this.dataSource.push(order);
    }

    get(id) {
        return this.dataSource.find(o => o.orderId === id);
    }
}


