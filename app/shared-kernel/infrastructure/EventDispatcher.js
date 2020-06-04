module.exports = class EventDispatcher {
    #subscriptions = [];

    dispatch(eventToBeDispatched) {
        this.#subscriptions.forEach(s => {
            if (eventToBeDispatched instanceof s.event) {
                const event = s.subscriber.execute(eventToBeDispatched);
                if (event != null) {
                    this.dispatch(event);
                }
            }
        })
    }
    subscribe(subscriber, event) {
        this.#subscriptions.push({
            event: event.prototype.constructor,
            subscriber
        })
    }
}
