export function asArray<T>(items: readonly T[] | T) {
    if (Array.isArray(items)) {
        return items;
    }

    return [items] as T[];
}
