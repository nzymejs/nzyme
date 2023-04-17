import { Ref, ref, watch } from 'vue';

export function localStorageRef<T>(key: string): Ref<T>;
export function localStorageRef<T>(key: string, defaultValue: T): Ref<T>;
export function localStorageRef<T>(key: string, defaultValue: T | null): Ref<T | null>;
export function localStorageRef<T>(key: string, defaultValue: T | undefined): Ref<T | undefined>;
export function localStorageRef<T>(key: string, defaultValue?: T | null | undefined) {
    const json = localStorage.getItem(key);
    const init = json ? JSON.parse(json) : defaultValue;
    const variable = ref<T>(init);

    watch(
        variable,
        value => {
            const json = JSON.stringify(value);
            localStorage.setItem(key, json);
        },
        { deep: true },
    );

    return variable;
}
