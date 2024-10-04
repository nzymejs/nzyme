export function isIterable(value: unknown): value is Iterable<unknown> {
    return value != null && typeof (value as Iterable<unknown>)[Symbol.iterator] === 'function';
}
