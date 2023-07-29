export function arrayToMap<T, K>(array: Iterable<T>, key: (item: T) => K): Map<K, T> {
    const map = new Map<K, T>();
    for (const item of array) {
        map.set(key(item), item);
    }

    return map;
}
