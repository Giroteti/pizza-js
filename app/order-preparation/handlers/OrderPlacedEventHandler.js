const NotEnoughIngredientsEvent = require('../domain/events/NotEnoughIngredients');
const PizzaNotOnTheMenuEvent = require('../domain/events/PizzaNotOnTheMenu');
const OrderAcceptedEvent = require('../domain/events/OrderAccepted');

const Order = require('../domain/Order');
module.exports = class OrderPlacedEventHandler {
    constructor(pizzeriaRepository, orderRepository) {
        this.pizzeriaRepository = pizzeriaRepository;
        this.orderRepository = orderRepository;
    }

    execute(orderPlacedEvent) {
        let event;
        this.orderRepository.save(
            new Order (
                orderPlacedEvent.orderId,
                orderPlacedEvent.pizzeriaId,
                orderPlacedEvent.pizzaFlavor
            )
        )
        const pizzeria = this.pizzeriaRepository.get(orderPlacedEvent.pizzeriaId);
        if (!pizzeria.isPizzaOnTheMenu(orderPlacedEvent.pizzaFlavor)) {
            event = new PizzaNotOnTheMenuEvent(orderPlacedEvent.orderId);
        } else {
            if (!pizzeria.hasEnoughIngredientsToCookPizza(orderPlacedEvent.pizzaFlavor)) {
                event = new NotEnoughIngredientsEvent(orderPlacedEvent.orderId);
            } else {
                event = new OrderAcceptedEvent(
                    orderPlacedEvent.orderId,
                    orderPlacedEvent.pizzeriaId,
                    orderPlacedEvent.customerId,
                    pizzeria.getPizzaPrice(orderPlacedEvent.pizzaFlavor)
                )
            }
        }
        return event;
    }
}
