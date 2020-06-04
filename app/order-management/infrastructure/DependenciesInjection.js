const {PlaceAnOrder} = require('../usecases/PlaceAnOrder');
const OrderPreparedEventHandler = require('../handlers/OrderPreparedEventHandler');
const OrderRejectedEventHandler = require('../handlers/OrderRejectedEventHandler');
const PaymentFailedEventHandler = require('../handlers/PaymentFailedEventHandler');
const CustomerRepository = require('../infrastructure/CustomerRepository');
const PizzeriaRepository = require('../infrastructure/PizzeriaRepository');
const IdGenerator = require('../infrastructure/IdGenerator');
const OrderRepository = require('../infrastructure/OrderRepository');

module.exports = class OrderManagementDependenciesInjection {
    #orderRepository = null;

    _provideOrderRepository() {
        if (this.#orderRepository == null) {
            this.#orderRepository = new OrderRepository();
        }
        return this.#orderRepository;
    }

    providePlaceAnOrderUsecase() {
        return new PlaceAnOrder(
            new IdGenerator(),
            this._provideOrderRepository(),
            new PizzeriaRepository(),
            new CustomerRepository()
        );
    }

    provideOrderPreparedEventHandler() {
        return new OrderPreparedEventHandler(
            this._provideOrderRepository()
        );
    }

    provideOrderRejectedEventHandler() {
        return new OrderRejectedEventHandler(
            this._provideOrderRepository()
        );
    }

    providePaymentFailedEventHandler() {
        return new PaymentFailedEventHandler(
            this._provideOrderRepository()
        );
    }
}
