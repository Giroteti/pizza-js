const customersDataTable = require('./tables/customers');
const _ = require("lodash");

module.exports = class CustomerRepository {
    #dataSource = _.cloneDeep(customersDataTable);
    get(id) {
        return this.#dataSource.find(c => c.id === id);
    }
}
