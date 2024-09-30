export function mapToMap<T, K>(arr: Iterable<T>, key: (item: T) => K): Map<K, T>;
export function mapToMap<T, K, R>(
    arr: Iterable<T>,
    key: (item: T) => K,
    value: (item: T) => R,
): Map<K, R>;
export function mapToMap<T, K>(
    arr: Iterable<T>,
    key: (item: T) => K,
    value?: (item: T) => unknown,
) {
    const result = new Map<K, unknown>();

    if (value) {
        for (const item of arr) {
            result.set(key(item), value(item));
        }
    } else {
        for (const item of arr) {
            result.set(key(item), item);
        }
    }

    return result;
}
