export function sumOver<T1>(array: Iterable<T1>, value: (item: T1) => number) {
    let sum = 0;
    for (const item of array) {
        sum += value(item);
    }

    return sum;
}
