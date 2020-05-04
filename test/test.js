const expect = require('expect');
const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const PizzaOrderedEvent = require('../app/domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../app/domain/PizzeriaNotFoundEvent');
const PizzeriaRepository = require('../app/infrastructure/PizzeriaRepository');

describe('Order a pizza', function() {
    describe('When pizzeria is found', () => {
        it('should return a PizzaOrderedEvent', () => {
            // given
            const pizzeriaRepository = new PizzeriaRepositoryForTest();
            const orderAPizza = new OrderAPizza(pizzeriaRepository);
            const command = new OrderAPizzaCommand(1);

            // when
            const event = orderAPizza.execute(command);

            // then
            expect(event).toBeInstanceOf(PizzaOrderedEvent);
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
    // When customer exists
    // When customer not exists
    // When pizza is on the menu
    // When pizza is not on the menu
    // When enough ingredients
    // When not enough ingredients
    // Make pizza (update ingredients stocks)
    // When payment mean is accepted by restaurant
    // When payment mean is not accepted by restaurant
    // When enough money to pay
    // When not enough money to pay
    // Pay (update pizzeria and owner account balances)
    // Register order
});

class PizzeriaRepositoryForTest extends PizzeriaRepository {
    #pizzerie = {
        1: {name: "Da Marco"}
    }
    get(id) {
        return this.#pizzerie[id];
    }
}
