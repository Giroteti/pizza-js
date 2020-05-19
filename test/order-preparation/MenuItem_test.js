const expect = require('chai').expect;
const {MenuItem} = require('../../app/order-preparation/domain/Pizzeria');

describe('MenuItem', function () {
    it('throws when pizza is null ', function () {
        expect(() => {
            new MenuItem(null, 10)
        }).to.throw();
    });
    it('throws when price is not an integer', function () {
        expect(() => {
            new MenuItem(new Pizza(1, "Margherita", []), NaN)
        }).to.throw();
    });
});
