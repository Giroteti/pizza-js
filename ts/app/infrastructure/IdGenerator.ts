export class IdGenerator {
    private lastId = 0;

    next(): number {
        return ++this.lastId;
    }
}
