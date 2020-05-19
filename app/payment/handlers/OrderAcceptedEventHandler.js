const PaymentFailedEvent = require('../domain/events/PaymentFailed');
const PaymentSucceededEvent = require('../domain/events/PaymentSucceeded');

module.exports = class OrderAcceptedEventHandler {
    constructor(pizzeriaRepository, customerRepository, paymentClient) {
        this.pizzeriaRepository = pizzeriaRepository;
        this.customerRepository = customerRepository;
        this.paymentClient = paymentClient;
    }

    execute(orderAcceptedEvent) {
        let event;
        const pizzeria = this.pizzeriaRepository.get(orderAcceptedEvent.pizzeriaId);
        const customer = this.customerRepository.get(orderAcceptedEvent.customerId);
        try {
            this.paymentClient.pay(
                customer.iban,
                pizzeria.iban,
                orderAcceptedEvent.pizzaPrice
            );
            event = new PaymentSucceededEvent(orderAcceptedEvent.orderId);
        } catch (e) {
            event = new PaymentFailedEvent(orderAcceptedEvent.orderId);
        }

        return event;
    }
}
