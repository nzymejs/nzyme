export function* mapIterable<T1, T2>(array: Iterable<T1>, map: (item: T1) => T2) {
    for (const item of array) {
        yield map(item);
    }
}
