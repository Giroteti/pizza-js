import { MenuDataObject, menusDataTable } from './tables/menus'
import * as _ from 'lodash'

export interface MenuLineDataObject {
    flavor: number;
    price: number
}

export class MenuRepository {
    private dataSource = _.cloneDeep(menusDataTable);

    getByPizzeriaId(pizzeriaId: number): MenuLineDataObject[] {
        const menu = this.dataSource.filter(m => m.pizzeriaId === pizzeriaId);
        return menu.map(m => ({
                flavor: m.pizzaId,
                price: m.price
            })
        );
    }
}
