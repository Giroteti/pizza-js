const expect = require('expect');
const _ = require("lodash");
const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const {OrderStatuses} = require('../app/domain/order'   );
const PizzaOrderedEvent = require('../app/domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../app/domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../app/domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../app/domain/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../app/domain/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../app/domain/PaymentFailedEvent');
const IdGenerator = require('../app/infrastructure/IdGenerator');
const OrderRepository = require('../app/infrastructure/OrderRepository');
const PizzeriaRepository = require('../app/infrastructure/PizzeriaRepository');
const CustomerRepository = require('../app/infrastructure/CustomerRepository');
const MenuRepository = require('../app/infrastructure/MenuRepository');
const PizzaRecipeRepository = require('../app/infrastructure/PizzaRecipeRepository');
const IngredientInventoryRepository = require('../app/infrastructure/IngredientInventoryRepository');
const PaymentClient = require('../app/infrastructure/PaymentClient');
const customerDataTable = require('../app/infrastructure/tables/customers');
const pizzerieDataTable = require('../app/infrastructure/tables/pizzerie');
const pizzeDataTable = require('../app/infrastructure/tables/pizze');
const menusDataTable = require('../app/infrastructure/tables/menus');

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

    beforeEach(() => {
        idGenerator = new IdGenerator();
        orderRepository = new OrderRepositoryForTest();
        pizzeriaRepository = new PizzeriaRepository();
        customerRepository = new CustomerRepository();
        menuRepository = new MenuRepository();
        pizzaRecipeRepository = new PizzaRecipeRepository();
        ingredientInventoryRepository = new IngredientInventoryRepository();
        paymentClient = new SuccessfulPaymentClientForTest();
        orderAPizza = new OrderAPizza(
            idGenerator,
            orderRepository,
            pizzeriaRepository,
            customerRepository,
            menuRepository,
            pizzaRecipeRepository,
            ingredientInventoryRepository,
            paymentClient
        );
    });

    describe('When pizzeria is found', () => {
        describe('When customer is found', () => {
            describe('When pizza is on the menu', () => {
                describe('When enough ingredients', () => {
                    describe('When payment succeeds', () => {
                        it('should record the order', () => {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(orderRepository.getOrderStatus(1)).toBe(OrderStatuses.FULFILLED);
                        });
                        it('should return a PizzaOrderedEvent', () => {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(event).toBeInstanceOf(PizzaOrderedEvent);
                        });
                        it('should perform payment', () => {
                            // given
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customer.id,
                                margherita
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(paymentClient.hasPaymentBeenPerformed(customer.rib, pizzeriaDaMarco.rib, margheritaPriceAtDaMarco))
                        });
                        it('should affect inventory', () => {
                            // given
                            const command = new OrderAPizzaCommand(pizzeriaDaMarco.id, customer.id, margherita);

                            // when
                            let event = null;
                            for (let i = 0; i <= 3; i++) {
                                event = orderAPizza.execute(command);
                            }

                            // then
                            expect(event).toBeInstanceOf(NotEnoughIngredientsEvent);
                        });
                    });
                    describe('When payment fails', () => {
                        it('should return a PaymentFailedEvent', () => {
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
                            expect(event).toBeInstanceOf(PaymentFailedEvent);
                        });
                    });
                });
                describe('When not enough ingredients', () => {
                    it('should return a NotEnoughIngredientsEvent', () => {
                        // given
                        const command = new OrderAPizzaCommand(
                            pizzeriaDaMarco.id,
                            customer.id,
                            quattroFormaggi
                        );

                        // when
                        const event = orderAPizza.execute(command);

                        // then
                        expect(event).toBeInstanceOf(NotEnoughIngredientsEvent);
                    });
                });
            });
            describe('When pizza is not on the menu', () => {
                it('should return a PizzaNotOnTheMenuEvent', () => {
                    // given
                    const command = new OrderAPizzaCommand(
                        pizzeriaDaMarco.id,
                        customer.id,
                        regina
                    );

                    // when
                    const event = orderAPizza.execute(command);

                    // then
                    expect(event).toBeInstanceOf(PizzaNotOnTheMenuEvent);
                });
            });
        });
        describe('When customer it not found', () => {
            it('should return a CustomerNotFoundEvent', () => {
                // given
                const command = new OrderAPizzaCommand(
                    pizzeriaDaMarco.id,
                    Symbol('unknown customer')
                );

                // when
                const event = orderAPizza.execute(command);

                // then
                expect(event).toBeInstanceOf(CustomerNotFoundEvent);
            });
        });
    });
    describe('When pizzeria is not found', () => {
        it('should return a PizzeriaNotFoundEvent', () => {
            // given
            const command = new OrderAPizzaCommand(
                Symbol("unknown pizzeria")
            );

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).toBeInstanceOf(PizzeriaNotFoundEvent);
        });
    });
});

class OrderRepositoryForTest extends OrderRepository {
    getOrderStatus(orderId) {
        const order = this.dataSource.find(o => o.id === orderId);
        if (order != null) {
            return order.status;
        } else {
            return null;
        }
    }
}

class SuccessfulPaymentClientForTest extends PaymentClient {
    #payments = [];

    hasPaymentBeenPerformed(customerRib, pizzeriaRib, amount) {
        return this.#payments.find(
            p => p.customerRib === customerRib
                && p.pizzeriaRib === pizzeriaRib
                && p.amount === amount
        ) != null;
    }

    pay(customerRib, pizzeriaRib, amount) {
        if (customerRib == null) {
            throw new Error('payment failed');
        } else {
            this.#payments.push({customerRib, pizzeriaRib, amount});
        }
    }
}

class FaultyPaymentClientForTest extends PaymentClient {
    pay(customerRib, pizzeriaRib, amount) {
        throw new Error('payment failed');
    }
}
