const expect = require('chai').expect;
const {Pizzeria, Pizza, Ingredient, MenuItem, Inventory, InventoryEntry} = require('../../app/order-preparation/domain/Pizzeria');

describe('Pizzeria', function () {

    const dough = new Ingredient(1, "Dough");
    const tomatoSauce = new Ingredient(2, "Tomato sauce");

    const margherita = new Pizza(
        1, "Margherita", [dough]
    )
    const quattroFormaggi = new Pizza(
        2, "Quattro formaggi", [dough]
    )
    const diavola = new Pizza(
        3, "Diavola", [dough, tomatoSauce]
    )

    context('instanciation', function () {
        it('throws when id is null ', () => {
            expect(() => {
                new Pizzeria(
                    null,
                    "Da Marco",
                    "iban",
                    [Symbol("menu item")],
                    new Inventory([])
                )
            }).to.throw();
        });
        it('throws when name is null ', () => {
            expect(() => {
                new Pizzeria(
                    1,
                    null,
                    "iban",
                    [Symbol("menu item")],
                    new Inventory([])
                )
            }).to.throw();
        });
        it('throws when rib is null', () => {
            expect(() => {
                new Pizzeria(
                    1,
                    "Da Marco",
                    null,
                    [Symbol("menu item")],
                    new Inventory([])
                )
            }).to.throw();
        });
        it('throw when menu is not an array', () => {
            expect(() => {
                new Pizzeria(
                    1,
                    "Da Marco",
                    "iban",
                    null,
                    new Inventory([])
                )
            }).to.throw();
        });
        it('throw when menu is empty', () => {
            expect(() => {
                new Pizzeria(
                    1,
                    "Da Marco",
                    "iban",
                    [],
                    new Inventory([])
                )
            }).to.throw();
        });
        it('throw when inventory is not an Inventory', () => {
            expect(() => {
                new Pizzeria(
                    1,
                    "Da Marco",
                    "iban",
                    [Symbol("menu item")],
                    "inventory"
                )
            }).to.throw();
        });
    });
    context('Successful instanciation', function () {
        let pizzeria;
        beforeEach(function () {
            pizzeria = new Pizzeria(
                1,
                "Da Marco",
                "iban",
                [
                    new MenuItem(
                        margherita, 10
                    ),
                    new MenuItem(
                        diavola, 12
                    )
                ],
                new Inventory([new InventoryEntry(dough.id, 1)])
            )
        });
        context('isPizzaOnTheMenu', () => {
            it('returns false when pizza not on the menu', () => {
                // when
                const isOnTheMenu = pizzeria.isPizzaOnTheMenu(quattroFormaggi.id)

                // then
                expect(isOnTheMenu).to.equal(false);
            });
            it('returns true when pizza on the menu', () => {
                // when
                const isOnTheMenu = pizzeria.isPizzaOnTheMenu(margherita.id)

                // then
                expect(isOnTheMenu).to.equal(true);
            });
        });
        context('hasEnoughIngredientsToCookPizza', () => {
            it('returns false when not enough ingredients', () => {
                // when
                const hasEnoughIngredients = pizzeria.hasEnoughIngredientsToCookPizza(
                    diavola.id
                );

                // then
                expect(hasEnoughIngredients).to.equal(false);
            });
            it('returns true when enough ingredients', () => {
                // when
                const hasEnoughIngredients = pizzeria.hasEnoughIngredientsToCookPizza(
                    margherita.id
                );

                // then
                expect(hasEnoughIngredients).to.equal(true);
            });
        });
        context('cookPizza', function () {
            it('should return pizza', () => {
                // when
                const pizza = pizzeria.cookPizza(
                    margherita.id
                );

                // then
                expect(pizza).to.equal(margherita);
            });
            it('should decrement inventory', () => {
                // when
                pizzeria.cookPizza(
                    margherita.id
                );

                // then
                expect(
                    pizzeria.hasEnoughIngredientsToCookPizza(margherita.id)
                ).to.equal(false);
            });
        });
    })
});
