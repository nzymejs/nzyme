import { Ref, ref } from 'vue';

/**
 * Creates a ref that is populated with promise result once it's resolved.
 * @param promise Ref will be populated with this promise's result.
 */
export function refAsync<T>(promise: Promise<T>): Ref<T | undefined>;
/**
 * Creates a ref that is populated with promise result once it's resolved.
 * @param fcn Function that returns a promise. Ref will be populated with this promise's result.
 */
export function refAsync<T>(fcn: () => Promise<T>): Ref<T | undefined>;
export function refAsync<T>(promise: Promise<T> | (() => Promise<T>)): Ref<T | undefined> {
    const reference = ref<T>();

    if (typeof promise === 'function') {
        promise = promise();
    }

    void promise.then(result => {
        reference.value = result;
    });

    return reference;
}
