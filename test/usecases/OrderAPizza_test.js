const expect = require('chai').expect;
const _ = require("lodash");
const PaymentClient = require('../../app/payment/infrastructure/PaymentClient');
const customerDataTable = require('../../app/shared-kernel/infrastructure/tables/customers');
const pizzerieDataTable = require('../../app/shared-kernel/infrastructure/tables/pizzerie');
const pizzeDataTable = require('../../app/shared-kernel/infrastructure/tables/pizze');
const menusDataTable = require('../../app/shared-kernel/infrastructure/tables/menus');
const EventDispatcher = require('../../app/shared-kernel/infrastructure/EventDispatcher');
const {PlaceAnOrderCommand} = require('../../app/order-management/usecases/PlaceAnOrder');
const OrderPlacedEvent = require('../../app/order-management/domain/events/OrderPlaced');
const OrderAcceptedEvent = require('../../app/order-preparation/domain/events/OrderAccepted');
const OrderRejectedEvent = require('../../app/order-preparation/domain/events/OrderRejected');
const OrderPreparedEvent = require('../../app/order-preparation/domain/events/OrderPrepared');
const PaymentFailedEvent = require('../../app/payment/domain/events/PaymentFailed');
const PaymentSucceededEvent = require('../../app/payment/domain/events/PaymentSucceeded');
const PizzeriaNotFoundEvent = require('../../app/order-management/domain/PizzeriaNotFound');
const CustomerNotFoundEvent = require('../../app/order-management/domain/events/CustomerNotFound');
const OrderFulfilledEvent = require('../../app/order-management/domain/events/OrderFulfilled');
const PizzaNotOnTheMenuEvent = require('../../app/order-preparation/domain/events/PizzaNotOnTheMenu');
const NotEnoughIngredientsEvent = require('../../app/order-preparation/domain/events/NotEnoughIngredients');
const OrderManagementDependenciesInjection = require('../../app/order-management/infrastructure/DependenciesInjection');
const OrderPreparationDependenciesInjection = require('../../app/order-preparation/infrastructure/DependenciesInjection');
const PaymentDependenciesInjection = require('../../app/payment/infrastructure/DependenciesInjection');
const OrderRepository = require('../../app/order-management/infrastructure/OrderRepository');

describe('Order a pizza', function () {

    const margheritaPriceAtDaMarco = menusDataTable[0].price;
    const pizzeriaDaMarco = pizzerieDataTable[0];
    const customer = customerDataTable[0];
    const margherita = pizzeDataTable[0].id;
    const quattroFormaggi = pizzeDataTable[1].id;
    const regina = pizzeDataTable[2].id;

    let placeAnOrder;
    let eventDispatcher;
    let paymentClient;
    let orderRepository;

    beforeEach(function () {
        paymentClient = new PaymentClientForTest();
        orderRepository = new OrderRepositoryForTest();
        const orderManagementDI = new OrderManagementDependenciesInjectionForTest(orderRepository);
        const orderPreparationDI = new OrderPreparationDependenciesInjection();
        const paymentDI = new PaymentDependenciesInjectionForTest(paymentClient);

        eventDispatcher = new EventDispatcherForTest();
        placeAnOrder = orderManagementDI.providePlaceAnOrderUsecase();

        const orderPlacedEventHandler = orderPreparationDI.provideOrderPlacedEventHandler();
        eventDispatcher.subscribe(orderPlacedEventHandler, OrderPlacedEvent);

        const orderAcceptedEventHandler = paymentDI.provideOrderAcceptedEventHandler();
        eventDispatcher.subscribe(orderAcceptedEventHandler, OrderAcceptedEvent);

        const paymentSucceededEventHandler = orderPreparationDI.providePaymentSucceededEventHandler();
        eventDispatcher.subscribe(paymentSucceededEventHandler, PaymentSucceededEvent);

        const orderRejectedEventHandler = orderManagementDI.provideOrderRejectedEventHandler();
        eventDispatcher.subscribe(orderRejectedEventHandler, OrderRejectedEvent);

        const paymentFailedEventHandler = orderManagementDI.providePaymentFailedEventHandler();
        eventDispatcher.subscribe(paymentFailedEventHandler, PaymentFailedEvent);

        const orderPreparedEventHandler = orderManagementDI.provideOrderPreparedEventHandler();
        eventDispatcher.subscribe(orderPreparedEventHandler, OrderPreparedEvent);

    });

    describe('When pizzeria is found', function () {

        describe('When customer is found', function () {

            describe('When pizza is on the menu', function () {

                describe('When enough ingredients', function () {

                    describe('When payment succeeds', function () {

                        it('should record the order', function () {
                            // given
                            const command = new PlaceAnOrderCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            eventDispatcher.dispatch(placeAnOrder.execute(command));

                            // then
                            expect(orderRepository.isFulfilled(1)).to.equal(true);
                        });

                        it('should return an OrderFulfilledEvent', function () {
                            // given
                            const command = new PlaceAnOrderCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            eventDispatcher.dispatch(placeAnOrder.execute(command));

                            // then
                            expect(eventDispatcher.hasDispatchedEvent(OrderFulfilledEvent)).to.be.true;
                        });

                        it('should perform payment', function () {
                            // given
                            const command = new PlaceAnOrderCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            eventDispatcher.dispatch(placeAnOrder.execute(command));

                            // then
                            expect(paymentClient.hasPaymentBeenPerformed(customer.iban, pizzeriaDaMarco.iban, margheritaPriceAtDaMarco))
                        });

                        it('should affect inventory', function () {
                            // given
                            const command = new PlaceAnOrderCommand(pizzeriaDaMarco.id, customer.id, margherita);

                            // when
                            let event = null;
                            for (let i = 0; i <= 3; i++) {
                                eventDispatcher.dispatch(placeAnOrder.execute(command));
                            }

                            // then
                            expect(eventDispatcher.hasDispatchedEvent(NotEnoughIngredientsEvent)).to.be.true;
                        });
                    });

                    describe('When payment fails', function () {

                        it('should return a PaymentFailedEvent', function () {
                            // given
                            paymentClient.setIsFaulty(true);
                            const command = new PlaceAnOrderCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            eventDispatcher.dispatch(placeAnOrder.execute(command));

                            // then
                            expect(eventDispatcher.hasDispatchedEvent(PaymentFailedEvent)).to.be.true;
                        });
                    });
                });
                describe('When not enough ingredients', function () {

                    it('should return a NotEnoughIngredientsEvent', function () {
                        // given
                        const command = new PlaceAnOrderCommand(
                            pizzeriaDaMarco.id,
                            customer.id,
                            quattroFormaggi
                        );

                        // when
                        eventDispatcher.dispatch(placeAnOrder.execute(command));

                        // then
                        expect(eventDispatcher.hasDispatchedEvent(NotEnoughIngredientsEvent)).to.be.true;
                    });
                });
            });

            describe('When pizza is not on the menu', function () {

                it('should return a PizzaNotOnTheMenuEvent', function () {
                    // given
                    const command = new PlaceAnOrderCommand(
                        pizzeriaDaMarco.id,
                        customer.id,
                        regina
                    );

                    // when
                    eventDispatcher.dispatch(placeAnOrder.execute(command));

                    // then
                    expect(eventDispatcher.hasDispatchedEvent(PizzaNotOnTheMenuEvent)).to.be.true;
                });
            });
        });
        describe('When customer it not found', function () {

            it('should dispatch a CustomerNotFoundEvent', function () {
                // given
                const command = new PlaceAnOrderCommand(
                    pizzeriaDaMarco.id,
                    Symbol('unknown customer')
                );

                // when
                eventDispatcher.dispatch(placeAnOrder.execute(command));

                // then
                expect(eventDispatcher.hasDispatchedEvent(CustomerNotFoundEvent)).to.be.true;
            });
        });
    });
    describe('When pizzeria is not found', function () {

        it('should dispatch a PizzeriaNotFoundEvent', function () {
            // given
            const command = new PlaceAnOrderCommand(
                Symbol("unknown pizzeria")
            );

            // when
            eventDispatcher.dispatch(placeAnOrder.execute(command));

            // then
            expect(eventDispatcher.hasDispatchedEvent(PizzeriaNotFoundEvent)).to.be.true;
        });
    });
});

class PaymentDependenciesInjectionForTest extends PaymentDependenciesInjection {
    constructor(paymentClient) {
        super();
        this.paymentClient = paymentClient;
    }

    _providePaymentClient() {
        return this.paymentClient;
    }
}


class PaymentClientForTest extends PaymentClient {
    #payments = [];
    #isFaulty = false;

    hasPaymentBeenPerformed(customerIban, pizzeriaIban, amount) {
        return this.#payments.find(
            p => p.customerIban === customerIban
                && p.pizzeriaIban === pizzeriaIban
                && p.amount === amount
        ) != null;
    }

    setIsFaulty(isFaulty) {
        this.#isFaulty = isFaulty;
    }

    pay(customerIban, pizzeriaIban, amount) {
        if (this.#isFaulty) {
            throw new Error('payment failed');
        } else {
            this.#payments.push({customerIban, pizzeriaIban, amount});
        }
    }
}

class OrderManagementDependenciesInjectionForTest extends OrderManagementDependenciesInjection {
    constructor(orderRepository) {
        super();
        this.orderRepository = orderRepository;
    }
    _provideOrderRepository() {
        return this.orderRepository;
    }
}

class OrderRepositoryForTest extends OrderRepository {
    isFulfilled(orderId) {
        const order = this.get(orderId);
        return Boolean(order != null && order.isFulfilled())
    }
}

class EventDispatcherForTest extends EventDispatcher {
    #eventsDispatched = [];

    dispatch(eventToBeDispatched) {
        this.#eventsDispatched.push(eventToBeDispatched);
        super.dispatch(eventToBeDispatched);
    }

    hasDispatchedEvent(event) {
        return Boolean(this.#eventsDispatched.find(e => e instanceof event));
    }
}
