export function* concatIterable<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
    yield* a;
    yield* b;
}
