export function groupBy<T, K extends string | number>(array: readonly T[], key: (item: T) => K) {
    const result = {} as Record<K, T[] | undefined>;

    for (const item of array) {
        const groupKey = key(item);
        let group = result[groupKey];
        if (!group) {
            result[groupKey] = group = [];
        }

        group.push(item);
    }

    return result;
}
