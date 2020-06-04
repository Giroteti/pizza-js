const pizzerieDataTable = require('../../shared-kernel/infrastructure/tables/pizzerie');
const _ = require("lodash");
const Pizzeria = require('../domain/Pizzeria');

module.exports = class PizzeriaRepository {
    #pizzerieDataSource = _.cloneDeep(pizzerieDataTable);
    get(id) {
        const pizzeriaDTO = this.#pizzerieDataSource.find(p => p.id === id);
        if (pizzeriaDTO == null) {
            return null;
        }
        return new Pizzeria(pizzeriaDTO.id);
    }
}
