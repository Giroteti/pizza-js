const expect = require('chai').expect;
const {Pizza} = require('../../app/domain/Pizzeria');

describe('Pizza', function () {
    it('throws when id is null ', () => {
        expect(() => {
            new Pizza(null, "Margherita", [Symbol("ingredient")])
        }).to.throw();
    });
    it('throws when name is null ', () => {
        expect(() => {
            new Pizza(1, null, [Symbol("ingredient")])
        }).to.throw();
    });
    it('throws when ingredients is not an array ', () => {
        expect(() => {
            new Pizza(1, "Margherita", null)
        }).to.throw();
    });
    it('throws when ingredients is an empty array ', () => {
        expect(() => {
            new Pizza(1, "Margherita", [])
        }).to.throw();
    });
});
