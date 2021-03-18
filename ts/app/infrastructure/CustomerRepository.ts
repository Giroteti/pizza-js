import { CustomerDataObject, customersDataTable } from './tables/customers'
import * as _ from 'lodash'

export class CustomerRepository {
    private dataSource = _.cloneDeep(customersDataTable);

    get(id: number): CustomerDataObject {
        return this.dataSource.find(c => c.id === id);
    }
}
