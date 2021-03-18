import { PizzeriaDataObject, pizzerieDataTable } from './tables/pizzerie'
import * as _ from 'lodash'

export class PizzeriaRepository {
    private dataSource = _.cloneDeep(pizzerieDataTable);

    get(id: number): PizzeriaDataObject {
        return this.dataSource.find(p => p.id === id);
    }
}
