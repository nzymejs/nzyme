/**
 * Creates a promise with a resolve and reject function attached to it.
 * @returns A promise with a resolve and reject function attached to it.
 */
export function createPromise<T = void>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {
        promise,
        resolve,
        reject,
    };
}
