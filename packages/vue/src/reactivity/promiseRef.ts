import { Ref, ref, watch } from 'vue';

export interface PromiseRef<T> extends Ref<T> {
    promise: Promise<T>;
}

export function promiseRef<T>(): PromiseRef<T | undefined>;
export function promiseRef<T>(promise: Promise<T>): PromiseRef<T>;
export function promiseRef<T>(promise?: Promise<T | undefined>) {
    if (!promise) {
        promise = Promise.resolve(undefined);
    }

    const promiseRef = ref(wrapPromise(promise));
    const valueRef = ref<T>() as PromiseRef<T | undefined>;

    let runWatch = true;

    Object.defineProperty(valueRef, 'promise', {
        get: () => promiseRef.value,
        set: (value: Promise<T>) => {
            promiseRef.value = wrapPromise(value);
        },
    });

    watch(valueRef, value => {
        if (runWatch) {
            promiseRef.value = Promise.resolve(value);
        }
    });

    return valueRef;

    function wrapPromise(promise: Promise<T | undefined>) {
        void promise.then(result => {
            if (promiseRef.value === promise) {
                runWatch = false;
                valueRef.value = result;
                runWatch = true;
            }
        });

        return promise;
    }
}
