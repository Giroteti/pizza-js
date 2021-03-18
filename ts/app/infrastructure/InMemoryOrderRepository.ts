import _ from "lodash"
import { OrderDataObject, ordersDataTable } from './tables/orders'
import { Order } from '../domain/Order'

export interface OrderRepository {
    readonly dataSource: OrderDataObject[]
    save(order: Order): void
}

export class InMemoryOrderRepository implements OrderRepository {
    readonly dataSource: OrderDataObject[] = _.cloneDeep(ordersDataTable)

    save(order: Order): void {
        this.dataSource.push(
            {
                id: order.id,
                customerId: order.customerId,
                pizzeriaId: order.pizzeriaId,
                pizzaFlavor: order.pizzaFlavor,
                status: order.status
            }
        );
    }

}
