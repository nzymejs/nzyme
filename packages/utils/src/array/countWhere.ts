export function countWhere<T1>(array: Iterable<T1>, predicate: (item: T1) => unknown) {
    let count = 0;
    for (const item of array) {
        if (predicate(item)) {
            count++;
        }
    }

    return count;
}
