const expect = require('chai').expect;
const {Ingredient} = require('../../app/order-preparation/domain/Pizzeria');

describe('Ingredient', function () {
    it('throws when id is null', function () {
        expect(() => {
            new Ingredient(null, "Dough")
        }).to.throw();
    });
    it('throws when name is null', function () {
        expect(() => {
            new Ingredient(1, null)
        }).to.throw();
    });
});
