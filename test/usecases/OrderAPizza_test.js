const expect = require('chai').expect;
const _ = require("lodash");
const {OrderAPizza, OrderAPizzaCommand} = require('../../app/usecases/OrderAPizza');
const PizzaOrderedEvent = require('../../app/domain/events/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../../app/domain/events/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../../app/domain/events/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../../app/domain/events/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../../app/domain/events/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../../app/domain/events/PaymentFailedEvent');
const IdGenerator = require('../../app/infrastructure/IdGenerator');
const OrderRepository = require('../../app/infrastructure/OrderRepository');
const PizzeriaRepository = require('../../app/infrastructure/PizzeriaRepository');
const CustomerRepository = require('../../app/infrastructure/CustomerRepository');
const PaymentClient = require('../../app/infrastructure/PaymentClient');
const customerDataTable = require('../../app/infrastructure/tables/customers');
const pizzerieDataTable = require('../../app/infrastructure/tables/pizzerie');
const pizzeDataTable = require('../../app/infrastructure/tables/pizze');
const menusDataTable = require('../../app/infrastructure/tables/menus');

describe('Order a pizza', function () {

    const margheritaPriceAtDaMarco = menusDataTable[0].price;
    const pizzeriaDaMarco = pizzerieDataTable[0];
    const customer = customerDataTable[0];
    const margherita = pizzeDataTable[0].id;
    const quattroFormaggi = pizzeDataTable[1].id;
    const regina = pizzeDataTable[2].id;

    let idGenerator;
    let orderRepository;
    let pizzeriaRepository;
    let customerRepository;
    let menuRepository;
    let pizzaRecipeRepository;
    let ingredientInventoryRepository;
    let paymentClient;
    let orderAPizza;

    beforeEach(function () {
        idGenerator = new IdGenerator();
        orderRepository = new OrderRepository();
        pizzeriaRepository = new PizzeriaRepository();
        customerRepository = new CustomerRepository();
        paymentClient = new SuccessfulPaymentClientForTest();
        orderAPizza = new OrderAPizza(
            idGenerator,
            orderRepository,
            pizzeriaRepository,
            customerRepository,
            paymentClient
        );
    });

    describe('When pizzeria is found', function() {
        describe('When customer is found', function() {
            describe('When pizza is on the menu', function() {
                describe('When enough ingredients', function() {
                    describe('When payment succeeds', function() {
                        it('should record the order', function() {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(orderRepository.get(1).isFulfilled()).to.equal(true);
                        });
                        it('should return a PizzaOrderedEvent', function() {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(event).to.be.instanceof(PizzaOrderedEvent);
                        });
                        it('should perform payment', function() {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(paymentClient.hasPaymentBeenPerformed(customer.iban, pizzeriaDaMarco.iban, margheritaPriceAtDaMarco))
                        });
                        it('should affect inventory', function() {
                            // given
                            const command = new OrderAPizzaCommand(pizzeriaDaMarco.id, customer.id, margherita);

                            // when
                            let event = null;
                            for (let i = 0; i <= 3; i++) {
                                event = orderAPizza.execute(command);
                            }

                            // then
                            expect(event).to.be.instanceof(NotEnoughIngredientsEvent);
                        });
                    });
                    describe('When payment fails', function() {
                        it('should return a PaymentFailedEvent', function() {
                            // given
                            let paymentClient = new FaultyPaymentClientForTest();
                            let orderAPizza = new OrderAPizza(
                                idGenerator,
                                orderRepository,
                                pizzeriaRepository,
                                customerRepository,
                                menuRepository,
                                pizzaRecipeRepository,
                                ingredientInventoryRepository,
                                paymentClient
                            );
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(event).to.be.instanceof(PaymentFailedEvent);
                        });
                    });
                });
                describe('When not enough ingredients', function() {
                    it('should return a NotEnoughIngredientsEvent', function() {
                        // given
                        const command = new OrderAPizzaCommand(
                            pizzeriaDaMarco.id,
                            customer.id,
                            quattroFormaggi
                        );

                        // when
                        const event = orderAPizza.execute(command);

                        // then
                        expect(event).to.be.instanceof(NotEnoughIngredientsEvent);
                    });
                });
            });
            describe('When pizza is not on the menu', function() {
                it('should return a PizzaNotOnTheMenuEvent', function() {
                    // given
                    const command = new OrderAPizzaCommand(
                        pizzeriaDaMarco.id,
                        customer.id,
                        regina
                    );

                    // when
                    const event = orderAPizza.execute(command);

                    // then
                    expect(event).to.be.instanceof(PizzaNotOnTheMenuEvent);
                });
            });
        });
        describe('When customer it not found', function() {
            it('should return a CustomerNotFoundEvent', function() {
                // given
                const command = new OrderAPizzaCommand(
                    pizzeriaDaMarco.id,
                    Symbol('unknown customer')
                );

                // when
                const event = orderAPizza.execute(command);

                // then
                expect(event).to.be.instanceof(CustomerNotFoundEvent);
            });
        });
    });
    describe('When pizzeria is not found', function() {
        it('should return a PizzeriaNotFoundEvent', function() {
            // given
            const command = new OrderAPizzaCommand(
                Symbol("unknown pizzeria")
            );

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).to.be.instanceof(PizzeriaNotFoundEvent);
        });
    });
});

class SuccessfulPaymentClientForTest extends PaymentClient {
    #payments = [];

    hasPaymentBeenPerformed(customerIban, pizzeriaIban, amount) {
        return this.#payments.find(
            p => p.customerIban === customerIban
                && p.pizzeriaIban === pizzeriaIban
                && p.amount === amount
        ) != null;
    }

    pay(customerIban, pizzeriaIban, amount) {
        if (customerIban == null) {
            throw new Error('payment failed');
        } else {
            this.#payments.push({customerIban, pizzeriaIban, amount});
        }
    }
}

class FaultyPaymentClientForTest extends PaymentClient {
    pay(customerIban, pizzeriaIban, amount) {
        throw new Error('payment failed');
    }
}
