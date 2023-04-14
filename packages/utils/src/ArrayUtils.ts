import { Immutable } from '@nzyme/types';

export function arrayRemove<T>(array: T[], item: T) {
    const index = array.indexOf(item);
    if (index < 0) {
        return false;
    }

    array.splice(index, 1);
    return true;
}

export function asArray<T>(items: readonly T[] | T) {
    if (Array.isArray(items)) {
        return items;
    }

    return [items] as T[];
}

export function getLastItem<T>(array: Immutable<T[]>) {
    if (!array.length) {
        throw new Error('Collection is empty');
    }

    return array[array.length - 1];
}

export function splitIntoChunks<T>(array: T[], chunkSize: number) {
    if (chunkSize < 1) {
        throw new Error('Chunk must be greater than 0');
    }

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }

    return result;
}

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

export function filterNotNull<T>(array: readonly (T | null | undefined)[]) {
    return array.filter(x => x != null) as T[];
}

export function* mapIterable<T1, T2>(array: Iterable<T1>, map: (item: T1) => T2) {
    for (const item of array) {
        yield map(item);
    }
}

export function mapNotNull<T1, T2>(array: Iterable<T1>, map: (item: T1) => T2 | undefined | null) {
    const result: T2[] = [];
    for (const item of array) {
        const mapped = map(item);
        if (mapped != null) {
            result.push(mapped);
        }
    }

    return result;
}

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
