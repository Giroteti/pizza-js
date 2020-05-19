const expect = require('chai').expect;
const EventDispatcher = require('../../app/shared-kernel/infrastructure/EventDispatcher');

describe('EventDispatcher', function () {
    it('should dispatch event to subscribers', function () {
        // given
        const dispatcher = new EventDispatcher();
        const subscriber = new Subscriber();
        const dispatchedEvent = new EventLevel1();
        dispatcher.subscribe(subscriber, EventLevel1);

        // when
        dispatcher.dispatch(dispatchedEvent);

        // then
        expect(subscriber.hasBeenCalled()).to.equal(true);
    });
    it('should dispatch event to subscribers of superclass\'s events', function () {
        // given
        const dispatcher = new EventDispatcher();
        const subscriber = new Subscriber();
        const dispatchedEvent = new EventLevel2();
        dispatcher.subscribe(subscriber, EventLevel1);

        // when
        dispatcher.dispatch(dispatchedEvent);

        // then
        expect(subscriber.hasBeenCalled()).to.equal(true);
    });
});

class Subscriber {
    #hasBeenCalled = false;
    execute(event) {
        this.#hasBeenCalled = true;
    }
    hasBeenCalled() {
        return this.#hasBeenCalled;
    }
}

class EventLevel1 {}

class EventLevel2 extends EventLevel1 {}
