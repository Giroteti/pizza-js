import { pizzerieDataTable } from './tables/pizzerie'
import { PizzaDataObject } from './tables/pizze'
import * as _ from 'lodash'

export class PizzeriaRepository {
    private dataSource = _.cloneDeep(pizzerieDataTable);

    get(id: number): PizzaDataObject {
        return this.dataSource.find(p => p.id === id);
    }
}
