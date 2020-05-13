const expect = require('chai').expect;
const {InventoryEntry} = require('../../app/domain/Pizzeria');

describe('Inventory entry', function () {
    it("throws if ingredient id is null", function () {
        expect(() => {
            new InventoryEntry(null, 0)
        }).to.throw();
    });
    it("throws if quantity is non integer", function () {
        expect(() => {
            new InventoryEntry(1, NaN)
        }).to.throw();
    });
    it("throws if quantity is integer below 0", function () {
        expect(() => {
            new InventoryEntry(1, -1)
        }).to.throw();
    });
    it("is not available if quantity is 0", function () {
        // given
        const entry = new InventoryEntry(1, 0);

        // then
        expect(entry.isAvailable()).to.equal(false);
    });

    it("is available if quantity is above 0", function () {
        // given
        const entry = new InventoryEntry(1, 1);

        // then
        expect(entry.isAvailable()).to.equal(true);
    });
    it("becomes unavailable when quantity is 1 and decrement", function () {
        // given
        const entry = new InventoryEntry(1, 1);

        // when
        entry.decrement();

        // then
        expect(entry.isAvailable()).to.equal(false);
    });
});
