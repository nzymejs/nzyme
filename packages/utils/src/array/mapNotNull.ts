export function mapNotNull<T1, T2>(
    array: Iterable<T1>,
    map: (item: T1, index: number) => T2 | undefined | null,
) {
    const result: T2[] = [];

    let i = 0;
    for (const item of array) {
        const mapped = map(item, i++);
        if (mapped != null) {
            result.push(mapped);
        }
    }

    return result;
}
