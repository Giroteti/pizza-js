const OrderAcceptedEventHandler = require('../handlers/OrderAcceptedEventHandler');
const CustomerRepository = require('../infrastructure/CustomerRepository');
const PizzeriaRepository = require('../infrastructure/PizzeriaRepository');
const PaymentClient = require('../infrastructure/PaymentClient');

module.exports = class PaymentDependenciesInjection {

    _providePaymentClient() {
        return new PaymentClient();
    }

    provideOrderAcceptedEventHandler() {
        return new OrderAcceptedEventHandler(
            new PizzeriaRepository(),
            new CustomerRepository(),
            this._providePaymentClient()
        );
    }
}
