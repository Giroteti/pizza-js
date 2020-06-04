const OrderFailedEvent = require('./OrderFailed');
module.exports = class CustomerNotFoundEvent extends OrderFailedEvent {}
