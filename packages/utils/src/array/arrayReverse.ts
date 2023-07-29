export function arrayReverse<T>(array: readonly T[]): Iterable<T> {
    let index = array.length;

    const iterator: Iterator<T> = {
        next() {
            index--;
            return {
                done: index < 0,
                value: array[index],
            };
        },
    };

    return {
        [Symbol.iterator]: () => iterator,
    };
}
