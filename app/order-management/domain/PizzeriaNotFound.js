const OrderFailedEvent = require('./events/OrderFailed');
module.exports = class PizzeriaNotFoundEvent extends OrderFailedEvent {}
