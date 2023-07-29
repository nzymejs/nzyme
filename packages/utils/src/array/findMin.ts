export function findMin<T>(array: Iterable<T>, value: (item: T) => number) {
    let min: T | undefined;
    for (const item of array) {
        if (!min) {
            min = item;
        } else if (value(item) < value(min)) {
            min = item;
        }
    }

    return min;
}
