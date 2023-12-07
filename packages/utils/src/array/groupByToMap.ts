export function groupByToMap<T, K extends string | number>(
    array: readonly T[],
    key: (item: T) => K,
) {
    const result = new Map<K, T[]>();

    for (const item of array) {
        const groupKey = key(item);
        let group = result.get(groupKey);
        if (!group) {
            group = [];
            result.set(groupKey, group);
        }

        group.push(item);
    }

    return result;
}
