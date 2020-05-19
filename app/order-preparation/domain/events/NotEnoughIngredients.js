const OrderRejectedEvent = require('./OrderRejected');
module.exports = class NotEnoughIngredients extends OrderRejectedEvent {}
