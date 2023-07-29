export function filterNotNull<T>(array: readonly (T | null | undefined)[]) {
    return array.filter(x => x != null) as T[];
}
