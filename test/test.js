const expect = require('chai').expect;

const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const {PizzaFlavors, Ingredients} = require('../app/domain/pizza');
const PizzaOrderedEvent = require('../app/domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../app/domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../app/domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../app/domain/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../app/domain/NotEnoughIngredientsEvent');
const PizzeriaRepository = require('../app/infrastructure/PizzeriaRepository');
const CustomerRepository = require('../app/infrastructure/CustomerRepository');
const MenuRepository = require('../app/infrastructure/MenuRepository');
const PizzaRecipeRepository = require('../app/infrastructure/PizzaRecipeRepository');
const IngredientInventoryRepository = require('../app/infrastructure/IngredientInventoryRepository');

describe('Order a pizza', function () {
    describe('When pizzeria is found', function() {
        describe('When customer is found', function() {
            describe('When pizza is on the menu', function() {
                describe('When enough ingredients', function() {
                    it('should return a PizzaOrderedEvent', function() {
                        // given
                        const pizzeriaRepository = new PizzeriaRepositoryForTest();
                        const customerRepository = new CustomerRepositoryForTest();
                        const menuRepository = new MenuRepositoryForTest();
                        const pizzaRecipeRepository = new PizzaRecipeRepositoryForTest();
                        const ingredientInventoryRepository = new IngredientInventoryRepositoryForTest();

                        const orderAPizza = new OrderAPizza(
                            pizzeriaRepository,
                            customerRepository,
                            menuRepository,
                            pizzaRecipeRepository,
                            ingredientInventoryRepository
                        );
                        const command = new OrderAPizzaCommand(1, 1, PizzaFlavors.MARGHERITA);

                        // when
                        const event = orderAPizza.execute(command);

                        // then
                        expect(event).to.be.an.instanceof(PizzaOrderedEvent);
                    });
                    it('should affect inventory', function() {
                        // given
                        const pizzeriaRepository = new PizzeriaRepositoryForTest();
                        const customerRepository = new CustomerRepositoryForTest();
                        const menuRepository = new MenuRepositoryForTest();
                        const pizzaRecipeRepository = new PizzaRecipeRepositoryForTest();
                        const ingredientInventoryRepository = new IngredientInventoryRepositoryForTest();

                        const orderAPizza = new OrderAPizza(
                            pizzeriaRepository,
                            customerRepository,
                            menuRepository,
                            pizzaRecipeRepository,
                            ingredientInventoryRepository
                        );
                        const command = new OrderAPizzaCommand(1, 1, PizzaFlavors.MARGHERITA);

                        // when
                        let event = null;
                        for (let i = 0; i <= 3; i++) {
                            event = orderAPizza.execute(command);
                        }

                        // then
                        expect(event).to.be.an.instanceof(NotEnoughIngredientsEvent);
                    });
                });
                describe('When not enough ingredients', function() {
                    it('should return a NotEnoughIngredientsEvent', function() {
                        // given
                        const pizzeriaRepository = new PizzeriaRepositoryForTest();
                        const customerRepository = new CustomerRepositoryForTest();
                        const menuRepository = new MenuRepositoryForTest();
                        const pizzaRecipeRepository = new PizzaRecipeRepositoryForTest();
                        const ingredientInventoryRepository = new IngredientInventoryRepositoryForTest();

                        const orderAPizza = new OrderAPizza(
                            pizzeriaRepository,
                            customerRepository,
                            menuRepository,
                            pizzaRecipeRepository,
                            ingredientInventoryRepository
                        );
                        const command = new OrderAPizzaCommand(1, 1, PizzaFlavors.QUATTRO_FORMAGGI);

                        // when
                        const event = orderAPizza.execute(command);

                        // then
                        expect(event).to.be.an.instanceof(NotEnoughIngredientsEvent);
                    });
                });
            });
            describe('When pizza is not on the menu', function() {
                it('should return a PizzaNotOnTheMenuEvent', function() {
                    // given
                    const pizzeriaRepository = new PizzeriaRepositoryForTest();
                    const customerRepository = new CustomerRepositoryForTest();
                    const menuRepository = new MenuRepositoryForTest();
                    const orderAPizza = new OrderAPizza(
                        pizzeriaRepository,
                        customerRepository,
                        menuRepository
                    );
                    const command = new OrderAPizzaCommand(1, 1, PizzaFlavors.REGINA);

                    // when
                    const event = orderAPizza.execute(command);

                    // then
                    expect(event).to.be.an.instanceof(PizzaNotOnTheMenuEvent);
                });
            });
        });
        describe('When customer it not found', function() {
            it('should return a CustomerNotFoundEvent', function() {
                // given
                const pizzeriaRepository = new PizzeriaRepositoryForTest();
                const customerRepository = new CustomerRepositoryForTest();
                const orderAPizza = new OrderAPizza(pizzeriaRepository, customerRepository);
                const command = new OrderAPizzaCommand(1, -1);

                // when
                const event = orderAPizza.execute(command);

                // then
                expect(event).to.be.an.instanceof(CustomerNotFoundEvent);
            });
        });
    });
    describe('When pizzeria is not found', function() {
        it('should return a PizzeriaNotFoundEvent', function() {
            // given
            const pizzeriaRepository = new PizzeriaRepositoryForTest();
            const orderAPizza = new OrderAPizza(pizzeriaRepository);
            const command = new OrderAPizzaCommand(-1);

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).to.be.an.instanceof(PizzeriaNotFoundEvent);
        });
    });

    // TODO
    // When payment succeed
    // When payment fails
    // Register order status : CREATED, IN_PROGESS, DONE
    // Fidelity program :
    //     Customer.isPremium : boolean
    //     Restaurant.premiumCustomerDiscount : ex: 0.2
});

class PizzeriaRepositoryForTest extends PizzeriaRepository {
    #pizzerie = {
        1: {name: "Da Marco"}
    }

    get(id) {
        return this.#pizzerie[id];
    }
}

class CustomerRepositoryForTest extends CustomerRepository {
    #customers = {
        1: {name: "Leonardo"}
    }

    get(id) {
        return this.#customers[id];
    }
}

class MenuRepositoryForTest extends MenuRepository {
    #menus = {
        1: [
            PizzaFlavors.MARGHERITA,
            PizzaFlavors.QUATTRO_FORMAGGI
        ]
    }
    getByPizzeriaId(pizzeriaId) {
        return this.#menus[pizzeriaId]
    }
}

class PizzaRecipeRepositoryForTest extends PizzaRecipeRepository {
    #recipes = {}
    constructor() {
        super();
        this.#recipes[PizzaFlavors.MARGHERITA] = [
            Ingredients.DOUGH,
            Ingredients.TOMATO_SAUCE,
            Ingredients.MOZZARELLA,
            Ingredients.BASIL
        ];
        this.#recipes[PizzaFlavors.QUATTRO_FORMAGGI] = [
            Ingredients.DOUGH,
            Ingredients.MOZZARELLA,
            Ingredients.GORGONZOLA,
            Ingredients.ASIAGO,
            Ingredients.PROVOLA
        ];
    }
    getByPizzaFlavorId(pizzaFlavorId) {
        return this.#recipes[pizzaFlavorId];
    }
}

class IngredientInventoryRepositoryForTest extends IngredientInventoryRepository {
    #inventories = {}
    constructor() {
        super();
        this.#inventories[1] = [];
        this.#inventories[1][Ingredients.DOUGH] = 3;
        this.#inventories[1][Ingredients.TOMATO_SAUCE] = 10;
        this.#inventories[1][Ingredients.MOZZARELLA] = 10;
        this.#inventories[1][Ingredients.BASIL] = 10;
    }
    getByPizzeriaId(pizzeriaId) {
        return this.#inventories[pizzeriaId];
    }

    updateByPizzeriaId(pizzeriaId, inventory) {
        this.#inventories[pizzeriaId] = inventory;
    }
}
