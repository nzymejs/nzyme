import { computed, type Ref } from 'vue';

export function nestedRef<T extends object, K extends keyof T>(obj: Ref<T>, key: K): Ref<T[K]> {
    return computed({
        get: () => obj.value[key],
        set: (value: T[K]) => {
            obj.value[key] = value;
        },
    });
}
