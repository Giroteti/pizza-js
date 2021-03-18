import { menusDataTable } from '../app/infrastructure/tables/menus'
import { pizzerieDataTable } from '../app/infrastructure/tables/pizzerie'
import { pizzeDataTable } from '../app/infrastructure/tables/pizze'
import { customersDataTable } from '../app/infrastructure/tables/customers'
import { IdGenerator } from '../app/infrastructure/IdGenerator'
import { PizzeriaRepository } from '../app/infrastructure/PizzeriaRepository'
import { CustomerRepository } from '../app/infrastructure/CustomerRepository'
import { MenuRepository } from '../app/infrastructure/MenuRepository'
import { IngredientInventoryRepository } from '../app/infrastructure/IngredientInventoryRepository'
import { Order, OrderStatuses } from '../app/domain/Order'
import { OrderRepository } from '../app/infrastructure/InMemoryOrderRepository'
import { PaymentClient, PaymentClientDataObject } from '../app/infrastructure/PaymentClient'
import { PizzaRecipeRepository } from '../app/infrastructure/PizzaRecipeRepository'
import { OrderAPizza, OrderAPizzaCommand } from '../app/usecases/OrderAPizza'
import { CustomerNotFoundEvent } from '../app/domain/CustomerNotFoundEvent'
import { PizzeriaNotFoundEvent } from '../app/domain/PizzeriaNotFoundEvent'
import { PizzaNotOnTheMenuEvent } from '../app/domain/PizzaNotOnTheMenuEvent'
import { PizzaOrderedEvent } from '../app/domain/PizzaOrderedEvent'
import { NotEnoughIngredientsEvent } from '../app/domain/NotEnoughIngredientsEvent'
import { PaymentFailedEvent } from '../app/domain/PaymentFailedEvent'
import { OrderDataObject, ordersDataTable } from '../app/infrastructure/tables/orders'
import * as _ from 'lodash'

describe('Order a pizza ts', () => {

    const margheritaPriceAtDaMarco = menusDataTable[0].price;
    const pizzeriaDaMarco = pizzerieDataTable[0];
    const customer = customersDataTable[0];
    const margherita = pizzeDataTable[0].id;
    const quattroFormaggi = pizzeDataTable[1].id;
    const regina = pizzeDataTable[2].id;

    let idGenerator: IdGenerator
    let orderRepository: OrderRepositoryForTest
    let pizzeriaRepository: PizzeriaRepository
    let customerRepository: CustomerRepository
    let menuRepository: MenuRepository
    let pizzaRecipeRepository: PizzaRecipeRepository
    let ingredientInventoryRepository: IngredientInventoryRepository
    let paymentClient: SuccessfulPaymentClientForTest
    let orderAPizza: OrderAPizza;

    beforeEach(function () {
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
                            expect(orderRepository.getOrderStatus(1)).toEqual(OrderStatuses.FULFILLED);
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
                            expect(event).toBeInstanceOf(PizzaOrderedEvent);
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
                            expect(event).toBeInstanceOf(NotEnoughIngredientsEvent);
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
                            expect(event).toBeInstanceOf(PaymentFailedEvent);
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
                        expect(event).toBeInstanceOf(NotEnoughIngredientsEvent);
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
                    expect(event).toBeInstanceOf(PizzaNotOnTheMenuEvent);
                });
            });
        });
        describe('When customer it not found', function() {
            it('should return a CustomerNotFoundEvent', function() {
                const unknowCustomer = -1
                // given
                const command = new OrderAPizzaCommand(
                    pizzeriaDaMarco.id,
                    unknowCustomer,
                    null
                );

                // when
                const event = orderAPizza.execute(command);

                // then
                expect(event).toBeInstanceOf(CustomerNotFoundEvent);
            });
        });
    });
    describe('When pizzeria is not found', function() {
        it('should return a PizzeriaNotFoundEvent', function() {
            // given
            const unknowPizzeria = -1
            const command = new OrderAPizzaCommand(
                unknowPizzeria, null,null
            );

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).toBeInstanceOf(PizzeriaNotFoundEvent);
        });
    });
});

class OrderRepositoryForTest implements OrderRepository{
    readonly dataSource: OrderDataObject[] = _.cloneDeep(ordersDataTable)

    save(order: Order): void {
        this.dataSource.push(order)
    }

    getOrderStatus(orderId: number): OrderStatuses | null {
        const orderDataObject = this.dataSource.find(o => o.id === orderId);
        if (orderDataObject != null) {
            return orderDataObject.status;
        } else {
            return null;
        }
    }
}

class SuccessfulPaymentClientForTest extends PaymentClient {
    private payments: PaymentClientDataObject[] = [];

    hasPaymentBeenPerformed(customerIban: string, pizzeriaIban: string, amount: number): boolean {
        return Boolean(this.payments.find(
            p => p.customerIban === customerIban
                && p.pizzeriaIban === pizzeriaIban
                && p.amount === amount
        ))
    }

    pay(customerIban: string, pizzeriaIban: string, amount: number): void {
        if (customerIban == null) {
            throw new Error('payment failed');
        } else {
            this.payments.push({customerIban, pizzeriaIban, amount});
        }
    }
}

class FaultyPaymentClientForTest extends PaymentClient {
    pay(customerIban: string, pizzeriaIban: string, amount: number): void {
        throw new Error('payment failed');
    }
}