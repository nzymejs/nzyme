import { Immutable } from '@nzyme/types';

export function getLastItem<T>(array: Immutable<T[]>) {
    if (!array.length) {
        throw new Error('Collection is empty');
    }

    return array[array.length - 1];
}
