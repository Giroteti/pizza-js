const customersDataTable = require('../../shared-kernel/infrastructure/tables/customers');
const _ = require("lodash");
const Customer = require('../domain/Customer');

module.exports = class PizzeriaRepository {
    #customersDataSource = _.cloneDeep(customersDataTable);
    get(id) {
        const customerDTO = this.#customersDataSource.find(c => c.id === id);
        if (customerDTO == null) {
            return null;
        }
        return new Customer(customerDTO.id);
    }
}
