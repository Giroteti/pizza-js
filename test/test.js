const expect = require('expect');
const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const {PizzaFlavors, Ingredients} = require('../app/domain/pizza');
const {OrderStatuses} = require('../app/domain/order');
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

describe('Order a pizza', function () {
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
        idGenerator = new IdGeneratorForTest();
        orderRepository = new OrderRepositoryForTest();
        pizzeriaRepository = new PizzeriaRepositoryForTest();
        customerRepository = new CustomerRepositoryForTest();
        menuRepository = new MenuRepositoryForTest();
        pizzaRecipeRepository = new PizzaRecipeRepositoryForTest();
        ingredientInventoryRepository = new IngredientInventoryRepositoryForTest();
        paymentClient = new PaymentClientForTest();
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
                                customerWithValidRib.id,
                                PizzaFlavors.MARGHERITA
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
                                customerWithValidRib.id,
                                PizzaFlavors.MARGHERITA
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
                                customerWithValidRib.id,
                                PizzaFlavors.MARGHERITA
                            );

                            // when
                            const event = orderAPizza.execute(command);

                            // then
                            expect(paymentClient.hasPaymentBeenPerformed(customerWithValidRib.rib, pizzeriaDaMarco.rib, margheritaPriceAtDaMarco))
                        });
                        it('should affect inventory', () => {
                            // given
                            const command = new OrderAPizzaCommand(pizzeriaDaMarco.id, customerWithValidRib.id, PizzaFlavors.MARGHERITA);

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
                            const command = new OrderAPizzaCommand(
                                pizzeriaDaMarco.id,
                                customerWithInvalidRib.id,
                                PizzaFlavors.MARGHERITA
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
                            customerWithValidRib.id,
                            PizzaFlavors.QUATTRO_FORMAGGI
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
                        customerWithValidRib.id,
                        PizzaFlavors.REGINA
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

const margheritaPriceAtDaMarco = 10;
const pizzeriaDaMarco = {
    id: Symbol("pizzeria da marco"),
    name: "Da Marco",
    rib: Symbol("rib")
}

const customerWithValidRib = {
    id: Symbol("customer with valid rib"),
    name: "Leonardo",
    rib: Symbol("valid rib")
}

const customerWithInvalidRib = {
    id: Symbol("customer with invalid rib"),
    name: "Michelangelo",
    rib: Symbol("invalid rib")
}

class IdGeneratorForTest extends IdGenerator {
    #lastId = 0;

    next() {
        return ++this.#lastId;
    }
}

class OrderRepositoryForTest extends OrderRepository {
    #orders = [];

    save(order) {
        this.#orders.push(order);
    }

    getOrderStatus(orderId) {
        const order = this.#orders.find(o => o.id === orderId);
        if (order != null) {
            return order.status;
        } else {
            return null;
        }
    }
}

class PizzeriaRepositoryForTest extends PizzeriaRepository {
    #pizzerie = [
        pizzeriaDaMarco
    ];

    get(id) {
        return this.#pizzerie.find(p => p.id === id);
    }
}

class CustomerRepositoryForTest extends CustomerRepository {
    #customers = [
        customerWithValidRib,
        customerWithInvalidRib
    ];

    get(id) {
        return this.#customers.find(c => c.id === id);
    }
}

class MenuRepositoryForTest extends MenuRepository {
    #menus = [
        {
            pizzeriaId: pizzeriaDaMarco.id,
            pizze: [
                {flavor: PizzaFlavors.MARGHERITA, price: margheritaPriceAtDaMarco},
                {flavor: PizzaFlavors.QUATTRO_FORMAGGI, price: 12}
            ]
        }
    ];

    getByPizzeriaId(pizzeriaId) {
        const menu = this.#menus.find(m => m.pizzeriaId === pizzeriaId);
        if (menu != null) {
            return menu.pizze;
        } else {
            return null;
        }
    }
}

class PizzaRecipeRepositoryForTest extends PizzaRecipeRepository {
    #recipes = [
        {
            pizzaFlavorId: PizzaFlavors.MARGHERITA,
            ingredients: [
                Ingredients.DOUGH,
                Ingredients.TOMATO_SAUCE,
                Ingredients.MOZZARELLA,
                Ingredients.BASIL
            ]
        },
        {
            pizzaFlavorId: PizzaFlavors.QUATTRO_FORMAGGI,
            ingredients: [
                Ingredients.DOUGH,
                Ingredients.MOZZARELLA,
                Ingredients.GORGONZOLA,
                Ingredients.ASIAGO,
                Ingredients.PROVOLA
            ]
        }
    ]

    getByPizzaFlavorId(pizzaFlavorId) {
        const recipe = this.#recipes.find(r => r.pizzaFlavorId === pizzaFlavorId);
        if (recipe != null) {
            return recipe.ingredients;
        } else {
            return null;
        }
    }
}

class IngredientInventoryRepositoryForTest extends IngredientInventoryRepository {
    #inventories = [
        {
            pizzeriaId: pizzeriaDaMarco.id,
            inventory: [
                {
                    ingredientId: Ingredients.DOUGH,
                    quantity: 3
                },
                {
                    ingredientId: Ingredients.TOMATO_SAUCE,
                    quantity: 10
                },
                {
                    ingredientId: Ingredients.MOZZARELLA,
                    quantity: 10
                },
                {
                    ingredientId: Ingredients.BASIL,
                    quantity: 10
                }
            ]
        }
    ];

    getByPizzeriaId(pizzeriaId) {
        const inventory = this.#inventories.find(i => i.pizzeriaId === pizzeriaId);
        if (inventory != null) {
            return inventory.inventory;
        } else {
            return null;
        }
    }

    decrementIngredientsOfPizzeria(pizzeriaId, ingredients) {
        for (const ingredientToDecrementIndex in ingredients) {
            const inventoryIndex = this.#inventories.findIndex(i => i.pizzeriaId === pizzeriaId);
            const ingredientIndex = this.#inventories[inventoryIndex].inventory.findIndex(i => i.ingredientId === ingredients[ingredientToDecrementIndex]);
            this.#inventories[inventoryIndex].inventory[ingredientIndex].quantity--;
        }
    }
}

class PaymentClientForTest extends PaymentClient {
    #payments = [];

    hasPaymentBeenPerformed(customerRib, pizzeriaRib, amount) {
        return this.#payments.find(
            p => p.customerRib === customerRib
                && p.pizzeriaRib === pizzeriaRib
                && p.amount === amount
        ) != null;
    }

    pay(customerRib, pizzeriaRib, amount) {
        if (customerRib === customerWithInvalidRib.rib) {
            throw new Error('payment failed');
        } else {
            this.#payments.push({customerRib, pizzeriaRib, amount});
        }
    }
}
