import debounce from 'lodash.debounce';
import { type Ref, onMounted, onUnmounted, ref, watch, shallowRef } from 'vue';

import { identity } from '@nzyme/utils';

export interface StorageRef<T> extends Ref<T> {
    reload(): void;
    startSync(): void;
    stopSync(): void;
    save(): void;
    clear(): void;
}

type StorageRefOptions = {
    key: string;
    sync?: 'when-mounted' | 'always';
    storage?: 'local' | 'session';
    deep?: boolean;
    debounce?: number;
};

type StorageRefDefault<T> = {
    default: () => T;
};

type StorageRefNoDefault = {
    default?: undefined;
};

type StorageRefOptionsRaw = StorageRefOptions & {
    json?: false;
    serialize?: undefined;
    deserialize?: undefined;
};

type StorageRefOptionsCustom<T> = StorageRefOptions & {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
    json?: false;
};

type StorageRefOptionsJson = StorageRefOptions & {
    json: true;
    serialize?: undefined;
    deserialize?: undefined;
};

const skipWrite = Symbol();
type StorageValue<T> = T & { [skipWrite]?: true };

export function storageRef(
    options: StorageRefOptionsRaw & StorageRefDefault<string>,
): StorageRef<string>;
export function storageRef(
    options: StorageRefOptionsRaw & StorageRefNoDefault,
): StorageRef<string | null>;
export function storageRef<T>(options: StorageRefOptionsJson & StorageRefDefault<T>): StorageRef<T>;
export function storageRef<T>(
    options: StorageRefOptionsJson & StorageRefNoDefault,
): StorageRef<T | null>;
export function storageRef<T>(options: StorageRefOptionsCustom<T>): StorageRef<T | null>;
export function storageRef<T>(
    options: StorageRefOptionsCustom<T> & StorageRefDefault<T>,
): StorageRef<T>;
export function storageRef<T>(
    options: (StorageRefOptionsRaw | StorageRefOptionsJson | StorageRefOptionsCustom<T>) &
        Partial<StorageRefDefault<T>>,
): StorageRef<T | null> {
    const key = options.key;
    const serialize =
        options.serialize ?? (options.json ? JSON.stringify : (identity as (value: T) => string));
    const deserialize =
        options.deserialize ?? ((options.json ? JSON.parse : identity) as (value: string) => T);
    const storage = getStorage(options.storage);

    const variable = options.deep
        ? (ref<T | null>(read()) as StorageRef<T>)
        : (shallowRef<T | null>(read()) as StorageRef<T>);

    const watcher = options.debounce ? debounce(write, options.debounce) : write;
    watch(variable, watcher, { deep: options.deep });

    variable.reload = reload;
    variable.startSync = startSync;
    variable.stopSync = stopSync;
    variable.save = save;
    variable.clear = clear;

    if (options.sync && storage) {
        if (options.sync === 'always') {
            startSync();
        } else if (options.sync === 'when-mounted') {
            onMounted(startSync);
            onUnmounted(stopSync);
        }
    }

    return variable;

    function reload(): T {
        const value = read();
        updateNoWrite(value);
        return value;
    }

    function read() {
        if (!storage) {
            return getDefault();
        }

        const item = storage.getItem(key);
        if (!item) {
            return getDefault();
        }

        return deserialize(item);
    }

    function updateNoWrite(value: T) {
        if (value != null && typeof value === 'object') {
            // Prevent writing back to localStorage
            (value as StorageValue<T>)[skipWrite] = true;
        }

        variable.value = value;
    }

    function write(value: T | null) {
        if (!storage) {
            return;
        }

        if (value == null) {
            storage.removeItem(key);
        } else if ((value as StorageValue<T>)[skipWrite]) {
            delete (value as StorageValue<T>)[skipWrite];
        } else {
            storage.setItem(key, serialize(value));
        }
    }

    function startSync() {
        window.addEventListener('storage', sync);
    }

    function stopSync() {
        window.removeEventListener('storage', sync);
    }

    function sync(event: StorageEvent) {
        if (event.storageArea === storage && event.key === key) {
            const value = event.newValue ? deserialize(event.newValue) : getDefault();
            updateNoWrite(value);
        }
    }

    function getDefault() {
        if (options.default) {
            return options.default();
        }

        return null as T;
    }

    function save() {
        write(variable.value);
    }

    function clear() {
        variable.value = getDefault();
    }
}

function getStorage(storage: 'local' | 'session' | undefined) {
    if (storage === 'session' && typeof sessionStorage !== 'undefined') {
        return sessionStorage;
    } else if (typeof localStorage !== 'undefined') {
        return localStorage;
    }

    return null;
}
