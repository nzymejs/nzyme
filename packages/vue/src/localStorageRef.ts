import { Ref, ref, watch } from 'vue';

import { localStorageGetJson, localStorageSetJson } from '@nzyme/dom';

export interface LocalStorageRef<T> extends Ref<T | null> {
    reload(): void;
}

export function localStorageRef<T>(key: string) {
    const variable = ref<T | null>(localStorageGetJson<T>(key)) as LocalStorageRef<T>;
    watch(variable, value => localStorageSetJson(key, value), { deep: true });

    variable.reload = reload;

    return variable;

    function reload(): T | null {
        return (variable.value = localStorageGetJson<T>(key));
    }
}
