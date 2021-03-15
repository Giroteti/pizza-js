const pizzerieDataTable = require('./tables/pizzerie');
const _ = require("lodash");

module.exports = class PizzeriaRepository {
    #dataSource = _.cloneDeep(pizzerieDataTable);
    get(id) {
        return pizzerieDataTable.find(p => p.id === id);
    }
}
