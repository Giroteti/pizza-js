module.exports = class IdGenerator {
    #lastId = 0;

    next() {
        return ++this.#lastId;
    }
}
