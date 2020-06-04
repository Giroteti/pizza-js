const OrderRejectedEvent = require('./OrderRejected');
module.exports = class PizzaNotOnTheMenuEvent extends OrderRejectedEvent {}
