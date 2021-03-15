const menusDataTable = require('./tables/menus');
const _ = require("lodash");

module.exports = class MenuRepository {
    #dataSource = _.cloneDeep(menusDataTable);

    getByPizzeriaId(pizzeriaId) {
        const menu = this.#dataSource.filter(m => m.pizzeriaId === pizzeriaId);
        return menu.map(m => {
                return {
                    flavor: m.pizzaId,
                    price: m.price
                }
            }
        );
    }
}
