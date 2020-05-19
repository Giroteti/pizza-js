const _ = require("lodash");

class Pizzeria {
    id
    name
    rib
    #menu = []
    #inventory

    constructor(id, name, rib, menu, inventory) {
        if (id == null) {
            throw new Error("id should not be null");
        }
        if (name == null) {
            throw new Error("name should not be null");
        }
        if (rib == null) {
            throw new Error("rib should not be null");
        }
        if (!Array.isArray(menu) || menu.length === 0) {
            throw new Error("menu should be an array");
        }
        if (!(inventory instanceof Inventory)) {
            throw new Error("inventory should be an Inventory");
        }
        this.id = id;
        this.name = name;
        this.rib = rib;
        menu.forEach(i => this.#menu[i.pizzaId] = i);
        this.#inventory = inventory;
    }

    isPizzaOnTheMenu(pizzaId) {
        return Boolean(this.#menu[pizzaId]);
    }

    hasEnoughIngredientsToCookPizza(pizzaId) {
        const item = this.#menu[pizzaId];
        return this.#inventory.hasIngredients(item.pizza.ingredients);
    }

    cookPizza(pizzaId) {
        const item = this.#menu[pizzaId];
        this.#inventory.decrementIngredients(item.pizza.ingredients);
    }

    getPizzaPrice(pizzaId) {
        const item = this.#menu[pizzaId];
        return item.price;
    }

    getSnapshot() {
        return this.#inventory.getSnapshot();
    }
}

class MenuItem {
    pizzaId
    pizza
    price

    constructor(pizza, price) {
        if (pizza == null) {
            throw new Error("pizza should not be null");
        }
        if (!Number.isInteger(price)) {
            throw new Error("price should be an integer");
        }
        this.pizza = pizza;
        this.price = price;
        this.pizzaId = pizza.id;
    }
}

class Pizza {
    id
    name
    ingredients = [];

    constructor(id, name, ingredients) {
        if (id == null) {
            throw new Error("id should not be null");
        }
        if (name == null) {
            throw new Error("name should not be null");
        }
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            throw new Error("ingredients should be an array");
        }
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
    }
}

class Ingredient {
    id
    name

    constructor(id, name) {
        if (id == null) {
            throw new Error('id should not be null');
        }
        if (name == null) {
            throw new Error('name should not be null');
        }
        this.id = id;
        this.name = name;
    }
}

class Inventory {
    #entries = [];

    constructor(entries) {
        if (!Array.isArray(entries)) {
            throw new Error("entries should be an array");
        }
        entries.forEach(e => this.#entries[e.ingredientId] = e);
    }

    hasIngredients(ingredients) {
        return this.#entries.length > 0 && ingredients.every(i => this._hasIngredient(i));
    }

    _hasIngredient(ingredient) {
        const entry = this.#entries[ingredient.id];
        return entry != null && entry.isAvailable();
    }

    decrementIngredients(ingredients) {
        ingredients.forEach(i => this._decrementIngredient(i));
    }

    _decrementIngredient(ingredient) {
        const entry = this.#entries[ingredient.id];
        entry.decrement();
    }

    getSnapshot() {
        return this.#entries.map(e => {
            return {ingredientId: e.ingredientId, quantity: e.quantity}
        });
    }
}

class InventoryEntry {
    ingredientId
    quantity

    constructor(ingredientId, quantity) {
        if (ingredientId == null) {
            throw new Error("ingredient id must not be null");
        }
        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new Error("quantity must be an integer greater or equal to 0");
        }
        this.ingredientId = ingredientId;
        this.quantity = quantity;
    }

    isAvailable() {
        return this.quantity > 0;
    }

    decrement() {
        if (this.isAvailable()) {
            this.quantity--;
        }
    }
}

module.exports = {
    InventoryEntry,
    Inventory,
    Pizza,
    MenuItem,
    Ingredient,
    Pizzeria
}
