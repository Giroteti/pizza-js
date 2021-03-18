import { MenuDataObject, menusDataTable } from './tables/menus'
import * as _ from 'lodash'

export class MenuRepository {
    private dataSource = _.cloneDeep(menusDataTable);

    getByPizzeriaId(pizzeriaId: number): MenuDataObject {
        const menu = this.dataSource.filter(m => m.pizzeriaId === pizzeriaId);
        return menu.map(m => {
                return {
                    flavor: m.pizzaId,
                    price: m.price
                }
            }
        );
    }
}
