export function findMax<T>(array: Iterable<T>, value: (item: T) => number) {
    let max: T | undefined;
    for (const item of array) {
        if (!max) {
            max = item;
        } else if (value(item) > value(max)) {
            max = item;
        }
    }

    return max;
}
