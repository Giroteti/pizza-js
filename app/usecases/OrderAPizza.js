const PizzaOrderedEvent = require('../domain/PizzaOrderedEvent');
const PizzeriaNotFoundEvent = require('../domain/PizzeriaNotFoundEvent');
const CustomerNotFoundEvent = require('../domain/CustomerNotFoundEvent');
const PizzaNotOnTheMenuEvent = require('../domain/PizzaNotOnTheMenuEvent');
const NotEnoughIngredientsEvent = require('../domain/NotEnoughIngredientsEvent');
const PaymentFailedEvent = require('../domain/PaymentFailedEvent');
const { Order, OrderStatuses } = require('../domain/order');

module.exports = {
    OrderAPizza: class OrderAPizza {
        constructor(
            idGenerator,
            orderRepository,
            pizzeriaRepository,
            customerRepository,
            menuRepository,
            pizzaRecipeRepository,
            ingredientInventoryRepository,
            paymentClient,
        ) {
            this.idGenerator = idGenerator;
            this.orderRepository = orderRepository;
            this.pizzeriaRepository = pizzeriaRepository;
            this.customerRepository = customerRepository;
            this.menuRepository = menuRepository;
            this.pizzaRecipeRepository = pizzaRecipeRepository;
            this.ingredientInventoryRepository = ingredientInventoryRepository;
            this.paymentClient = paymentClient;
        }
        execute(command) {
            const order = new Order(
                this.idGenerator.next(),
                command.customerId,
                command.pizzeriaId,
                command.pizzaFlavor
            );
            const pizzeria = this.pizzeriaRepository.get(command.pizzeriaId);
            if (pizzeria == null) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PizzeriaNotFoundEvent();
            }

            const customer = this.customerRepository.get(command.customerId);
            if (customer == null) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new CustomerNotFoundEvent();
            }

            const menu = this.menuRepository.getByPizzeriaId(command.pizzeriaId);
            const pizza = menu.find(p => p.flavor === command.pizzaFlavor);
            if (pizza == null) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PizzaNotOnTheMenuEvent();
            }

            const recipe = this.pizzaRecipeRepository.getByPizzaFlavorId(command.pizzaFlavor);
            const inventory = this.ingredientInventoryRepository.getByPizzeriaId(command.pizzeriaId);
            for (const i in recipe) {
                const ingredientToCheck = recipe[i];
                const ingredientInInventory = inventory.find(i => i.ingredientId === ingredientToCheck);
                if (ingredientInInventory == null || ingredientInInventory.quantity <= 0) {
                    order.status = OrderStatuses.ON_ERROR;
                    this.orderRepository.save(order);
                    return new NotEnoughIngredientsEvent();
                }
            }
            this.ingredientInventoryRepository.decrementIngredientsOfPizzeria(command.pizzeriaId, recipe);

            try {
                this.paymentClient.pay(customer.iban, pizzeria.iban, pizza.price);
            } catch (e) {
                order.status = OrderStatuses.ON_ERROR;
                this.orderRepository.save(order);
                return new PaymentFailedEvent();
            }

            order.status = OrderStatuses.FULFILLED;
            this.orderRepository.save(order);
            return new PizzaOrderedEvent();
        }
    },
    OrderAPizzaCommand: class OrderAPizzaCommand{
        constructor(pizzeriaId, customerId, pizzaFlavor) {
            this.pizzeriaId = pizzeriaId;
            this.customerId = customerId;
            this.pizzaFlavor = pizzaFlavor;
        }
    }
}
