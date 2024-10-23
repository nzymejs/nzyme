import { type Ref, customRef } from 'vue';

/** Ref that is not tracked. */
export function constRef<T>(value: T): Readonly<Ref<T>> {
    return customRef(() => ({
        get() {
            return value;
        },
        set() {
            return;
        },
    }));
}
