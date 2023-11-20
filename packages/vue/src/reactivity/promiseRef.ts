import { type Ref, ref, watch } from 'vue';

export interface PromiseRef<T, TValue extends T | undefined = T> extends Ref<TValue> {
    promise: Promise<T>;
    update(promise: Promise<T>): Promise<T>;
}

export function promiseRef<T>(): PromiseRef<T | undefined>;
export function promiseRef<T>(promise: Promise<T>): PromiseRef<T, T | undefined>;
export function promiseRef<T>(value: T): PromiseRef<T>;
export function promiseRef<T>(promiseOrValue?: Promise<T | undefined> | T) {
    let promise: Promise<T | undefined>;
    let value: T | undefined;
    if (promiseOrValue instanceof Promise) {
        promise = promiseOrValue;
        value = undefined;
    } else {
        promise = Promise.resolve(promiseOrValue);
        value = promiseOrValue;
    }

    const promiseRef = ref(wrapPromise(promise));
    const valueRef = ref<T | undefined>(value) as PromiseRef<T | undefined>;

    let runWatch = true;

    Object.defineProperties(valueRef, {
        promise: {
            get: () => promiseRef.value,
            set: (value: Promise<T>) => {
                promiseRef.value = wrapPromise(value);
            },
        },
        update: {
            value: update,
        },
    });

    watch(valueRef, value => {
        if (runWatch) {
            promiseRef.value = Promise.resolve(value);
        }
    });

    return valueRef;

    function wrapPromise(promise: Promise<T | undefined>) {
        const wrapped = promise.then(result => {
            if (promiseRef.value === wrapped) {
                try {
                    runWatch = false;
                    valueRef.value = result;
                } finally {
                    runWatch = true;
                }
            }

            return result;
        });

        return wrapped;
    }

    function update(promise: Promise<T | undefined>) {
        const wrapped = wrapPromise(promise);
        promiseRef.value = wrapped;
        return wrapped;
    }
}
