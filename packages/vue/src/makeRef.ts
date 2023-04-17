import { computed, isRef, ref, Ref } from 'vue';

export type RefParam<T> = Readonly<Ref<T>> | ((this: void) => T) | T;

export type RefParams<T extends object> = {
    [K in keyof T]-?: RefParam<T[K]>;
};

export function makeRef<T>(param: RefParam<T>): Readonly<Ref<T>> {
    if (isRef(param)) {
        return param;
    }

    if (param instanceof Function || typeof param === 'function') {
        return computed(param as (this: void) => T);
    }

    return ref(param) as Readonly<Ref<T>>;
}

export function unref<T>(ref: Ref<T>) {
    return ref as unknown as T;
}
