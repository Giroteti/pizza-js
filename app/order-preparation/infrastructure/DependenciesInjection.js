const OrderPlacedEventHandler = require('../handlers/OrderPlacedEventHandler');
const PaymentSuceededEventHandler = require('../handlers/PaymentSuccededEventHandler');
const PizzeriaRepository = require('../infrastructure/PizzeriaRepository');
const OrderRepository = require('../infrastructure/OrderRepository');

module.exports = class OrderPreparationDependenciesInjection {
    #pizzeriaRepository;
    #orderRepository;

    _providePizzeriaRepository() {
        if (this.#pizzeriaRepository == null) {
            this.#pizzeriaRepository = new PizzeriaRepository();
        }
        return this.#pizzeriaRepository;
    }

    _provideOrderRepository() {
        if (this.#orderRepository == null) {
            this.#orderRepository = new OrderRepository();
        }
        return this.#orderRepository;
    }

    provideOrderPlacedEventHandler() {
      return new OrderPlacedEventHandler(
          this._providePizzeriaRepository(),
          this._provideOrderRepository()
      );
    }
    providePaymentSucceededEventHandler() {
        return new PaymentSuceededEventHandler(
            this._providePizzeriaRepository(),
            this._provideOrderRepository()
        );
    }
}
