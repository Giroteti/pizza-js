const expect = require('expect');
const {OrderAPizza, OrderAPizzaCommand} = require('../app/usecases/OrderAPizza');
const PizzaOrderedEvent = require('../app/domain/PizzaOrderedEvent');

describe('Order a pizza', function() {
    it('should return a PizzaOrderedEvent', function() {
        // given
        const orderAPizza = new OrderAPizza();
        const command = new OrderAPizzaCommand();

        // when
        const event = orderAPizza.execute(command);

        // then
        expect(event).toBeInstanceOf(PizzaOrderedEvent);
    });
});
