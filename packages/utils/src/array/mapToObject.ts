export function mapToObject<T, K extends string>(
    arr: Iterable<T>,
    key: (item: T) => K,
): Record<K, T>;
export function mapToObject<T, K extends string, R>(
    arr: Iterable<T>,
    key: (item: T) => K,
    value: (item: T) => R,
): Record<K, R>;
export function mapToObject<T, K extends string>(
    arr: Iterable<T>,
    key: (item: T) => K,
    value?: (item: T) => unknown,
) {
    const result = {} as Record<K, unknown>;

    if (value) {
        for (const item of arr) {
            result[key(item)] = value(item);
        }
    } else {
        for (const item of arr) {
            result[key(item)] = item;
        }
    }

    return result;
}
