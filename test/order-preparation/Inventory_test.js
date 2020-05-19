const expect = require('chai').expect;
const {Inventory, InventoryEntry, Ingredient} = require('../../app/order-preparation/domain/Pizzeria');

describe('Inventory', function () {
    const dough = new Ingredient(1, 'Dough');
    const tomatoSauce = new Ingredient(2, 'Tomato sauce');
    const mozzarella = new Ingredient(3, 'Mozzarella');


    it('throws when entries is not an array', function () {
        expect(() => {
            new Inventory(null)
        }).to.throw();
    });
    context('hasIngredients', function () {
        it('returns true when all ingredients in inventory and available', () => {
            // given
            const inventory = new Inventory(
                [
                    new InventoryEntry(dough.id, 1),
                    new InventoryEntry(tomatoSauce.id, 1)
                ]
            )

            // when
            const hasIngredients = inventory.hasIngredients([
                dough,
                tomatoSauce
            ]);

            // then
            expect(hasIngredients).to.equal(true);
        });
        it('returns false when not all ingredients in inventory', function () {
            // given
            const inventory = new Inventory(
                [
                    new InventoryEntry(dough.id, 1)
                ]
            )

            // when
            const hasIngredients = inventory.hasIngredients([
                dough,
                tomatoSauce
            ]);

            // then
            expect(hasIngredients).to.equal(false);
        });
        it('returns false when at least one ingredients has run out', function () {
            // given
            const inventory = new Inventory(
                [
                    new InventoryEntry(dough.id, 1),
                    new InventoryEntry(tomatoSauce.id, 0)
                ]
            )

            // when
            const hasIngredients = inventory.hasIngredients([
                dough,
                tomatoSauce
            ]);

            // then
            expect(hasIngredients).to.equal(false);
        });
    });
    context('decrementIngredients', function() {
        it('should decrement ingredients', function () {
            // given
            const inventory = new Inventory(
                [
                    new InventoryEntry(dough.id, 1),
                    new InventoryEntry(tomatoSauce.id, 1),
                    new InventoryEntry(mozzarella.id, 1),
                ]
            )

            // when
            inventory.decrementIngredients([
                dough,
                mozzarella
            ]);

            // then
            expect(inventory.hasIngredients([dough])).to.equal(false);
            expect(inventory.hasIngredients([tomatoSauce])).to.equal(true);
            expect(inventory.hasIngredients([mozzarella])).to.equal(false);
        });
    });
});
