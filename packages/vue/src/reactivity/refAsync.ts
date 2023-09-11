import { Ref, ref } from 'vue';

import { writable } from '@nzyme/utils';

export interface RefAsync<T> extends Ref<T | undefined> {
    readonly promise: Promise<T>;
}

/**
 * Creates a ref that is populated with promise result once it's resolved.
 * @param promise Ref will be populated with this promise's result.
 */
export function refAsync<T>(promise: Promise<T>): RefAsync<T>;
/**
 * Creates a ref that is populated with promise result once it's resolved.
 * @param fcn Function that returns a promise. Ref will be populated with this promise's result.
 */
export function refAsync<T>(fcn: () => Promise<T>): RefAsync<T>;
export function refAsync<T>(promise: Promise<T> | (() => Promise<T>)): RefAsync<T> {
    const reference = ref<T>() as RefAsync<T>;

    if (typeof promise === 'function') {
        promise = promise();
    }

    writable(reference).promise = promise;

    void promise.then(result => {
        reference.value = result;
    });

    return reference;
}
