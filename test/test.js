const expect = require('expect');
const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const {PizzaFlavors} = require('../app/domain/pizza');
const PizzaOrderedEvent = require('../app/domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../app/domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../app/domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../app/domain/PizzaNotOnTheMenuEvent');
const PizzeriaRepository = require('../app/infrastructure/PizzeriaRepository');
const CustomerRepository = require('../app/infrastructure/CustomerRepository');
const MenuRepository = require('../app/infrastructure/MenuRepository');

describe('Order a pizza', function () {
    describe('When pizzeria is found', () => {
        describe('When customer is found', () => {
            describe('When pizza is on the menu', () => {
                it('should return a PizzaOrderedEvent', () => {
                    // given
                    const pizzeriaRepository = new PizzeriaRepositoryForTest();
                    const customerRepository = new CustomerRepositoryForTest();
                    const menuRepository = new MenuRepositoryForTest();
                    const orderAPizza = new OrderAPizza(
                        pizzeriaRepository,
                        customerRepository,
                        menuRepository
                    );
                    const command = new OrderAPizzaCommand(1, 1, PizzaFlavors.MARGHERITA);

                    // when
                    const event = orderAPizza.execute(command);

                    // then
                    expect(event).toBeInstanceOf(PizzaOrderedEvent);
                });
            });
            describe('When pizza is not on the menu', () => {
                it('should return a PizzaOrderedEvent', () => {
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
                    expect(event).toBeInstanceOf(PizzaNotOnTheMenuEvent);
                });
            });
        });
        describe('When customer it not found', () => {
            it('should return a CustomerNotFoundEvent', () => {
                // given
                const pizzeriaRepository = new PizzeriaRepositoryForTest();
                const customerRepository = new CustomerRepositoryForTest();
                const orderAPizza = new OrderAPizza(pizzeriaRepository, customerRepository);
                const command = new OrderAPizzaCommand(1, -1);

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
            const pizzeriaRepository = new PizzeriaRepositoryForTest();
            const orderAPizza = new OrderAPizza(pizzeriaRepository);
            const command = new OrderAPizzaCommand(-1);

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).toBeInstanceOf(PizzeriaNotFoundEvent);
        });
    });

    // TODO
    // When enough ingredients
    // When not enough ingredients
    // Make pizza (update ingredients stocks)
    // When payment mean is accepted by restaurant
    // When payment mean is not accepted by restaurant
    // When enough money to pay
    // When not enough money to pay
    // Pay (update pizzeria and owner account balances)
    // Register order
    // Customer.isPremium : boolean
    // Restaurant.premiumCustomerDiscount : ex: 0.2
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
