import { Order, OrderStatuses } from '../domain/Order'
import { CustomerNotFoundEvent } from '../domain/CustomerNotFoundEvent'
import { PizzeriaNotFoundEvent } from '../domain/PizzeriaNotFoundEvent'
import { PizzaNotOnTheMenuEvent } from '../domain/PizzaNotOnTheMenuEvent'
import { PizzaOrderedEvent } from '../domain/PizzaOrderedEvent'
import { NotEnoughIngredientsEvent } from '../domain/NotEnoughIngredientsEvent'
import { PaymentFailedEvent } from '../domain/PaymentFailedEvent'

export class OrderAPizza {
    constructor(
        private readonly idGenerator,
        private readonly orderRepository,
        private readonly pizzeriaRepository,
        private readonly customerRepository,
        private readonly menuRepository,
        private readonly pizzaRecipeRepository,
        private readonly ingredientInventoryRepository,
        private readonly paymentClient,
    ) {}
    execute(command: OrderAPizzaCommand) {
        const order = new Order(this.idGenerator.next(), command.customerId, command.pizzeriaId, command.pizzaFlavor);
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
}

export class OrderAPizzaCommand{
    constructor(
        readonly pizzeriaId,
        readonly customerId,
        readonly pizzaFlavor
    ) {}
}
