export function asArray<T>(items: T[] | T): T[];
export function asArray<T>(items: readonly T[] | T): readonly T[];
export function asArray<T>(items: readonly T[] | T) {
    if (Array.isArray(items)) {
        return items as T[];
    }

    return [items];
}
