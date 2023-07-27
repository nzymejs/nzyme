import { Ref, onMounted, onUnmounted, ref, watch } from 'vue';

import { isBrowser } from '@nzyme/dom';

export interface LocalStorageRef<T> extends Ref<T | null> {
    reload(): void;
    startSync(): void;
    stopSync(): void;
}

export interface LocalStorageRefOptions<T> {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    deep?: boolean;
    sync?: boolean | 'when-mounted';
}

const skipWrite = Symbol();
type StorageValue<T> = T & { [skipWrite]?: true };

export function localStorageRef<T>(key: string, options: LocalStorageRefOptions<T> = {}) {
    const serialize = options.serialize ?? (JSON.stringify as (value: T) => string);
    const deserialize = options.deserialize ?? (JSON.parse as (value: string) => T);

    const variable = ref<T | null>(read()) as LocalStorageRef<T>;
    watch(variable, write, { deep: options.deep });

    variable.reload = reload;

    if (options.sync && isBrowser()) {
        if (options.sync === true) {
            startSync();
        } else if (options.sync === 'when-mounted') {
            onMounted(startSync);
            onUnmounted(stopSync);
        }
    }

    return variable;

    function reload(): T | null {
        const value = read();
        updateNoWrite(value);
        return value;
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

    function updateNoWrite(value: T | null) {
        if (value != null && typeof value === 'object') {
            // Prevent writing back to localStorage
            (value as StorageValue<T>)[skipWrite] = true;
        }

        variable.value = value;
    }

    function write(value: T | null) {
        if (typeof localStorage === 'undefined') {
            return;
        }

        if (value == null) {
            localStorage.removeItem(key);
        } else if ((value as StorageValue<T>)[skipWrite]) {
            delete (value as StorageValue<T>)[skipWrite];
        } else {
            localStorage.setItem(key, serialize(value));
        }
    }

    function startSync() {
        window.addEventListener('storage', sync);
    }

    function stopSync() {
        window.removeEventListener('storage', sync);
    }

    function sync(event: StorageEvent) {
        if (event.key === key) {
            const value = event.newValue ? deserialize(event.newValue) : null;
            updateNoWrite(value);
        }
    }
}
