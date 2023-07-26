import { Ref, ref, watch } from 'vue';

export interface LocalStorageRef<T> extends Ref<T | null> {
    reload(): void;
}

export interface LocalStorageRefOptions<T> {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
}

export function localStorageRef<T>(key: string, options: LocalStorageRefOptions<T> = {}) {
    const serialize = options.serialize ?? (JSON.stringify as (value: T) => string);
    const deserialize = options.deserialize ?? (JSON.parse as (value: string) => T);

    const variable = ref<T | null>(read()) as LocalStorageRef<T>;
    watch(variable, write, { deep: true });

    variable.reload = reload;

    return variable;

    function reload(): T | null {
        return (variable.value = read());
    }

    function read() {
        if (typeof localStorage === 'undefined') {
            return null;
        }

        const item = localStorage.getItem(key);
        if (!item) {
            return null;
        }

        return deserialize(item);
    }

    function write(value: T | null) {
        if (typeof localStorage === 'undefined') {
            return;
        }

        if (value == null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, serialize(value));
        }
    }
}
