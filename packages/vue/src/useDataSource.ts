import debounce from 'lodash.debounce';
import { isRef, ref, watch, type Ref } from 'vue';

import { type CancelablePromise, isCancelablePromise } from '@nzyme/utils';

import { makeRef, type RefParam } from './reactivity/makeRef.js';
import { reactive } from './reactivity/reactive.js';

export interface DataSourceOptions<T, TResult> {
    /**
     * Request payload - it will be watched for changes to make calls.
     * Can be function or a reference.
     * If undefined is returned, API call will not be made.
     */
    readonly params: RefParam<T>;

    readonly load: (params: T) => Promise<TResult> | CancelablePromise<TResult>;

    /** Options for debouncing */
    readonly debounce?: {
        /** Number of milliseconds to debounce api calls */
        time?: number;
        leading?: boolean;
        trailing?: boolean;
    };

    /** Data will be loaded into this ref. Optional. */
    readonly data?: ((result: TResult) => void) | Ref<TResult | undefined>;
}

export interface DataSource<T> {
    readonly value: T | undefined;
    readonly pending: Promise<T> | null;
    readonly get: () => Promise<T>;
    readonly reload: () => Promise<T>;
    readonly clear: () => void;
}

export function useDataSource<T, TResult>(opts: DataSourceOptions<T, TResult>) {
    const dataRef: Ref<TResult | undefined> = isRef(opts.data) ? opts.data : ref();
    const dataCallback = isRef(opts.data) ? null : opts.data;
    const paramsRef = makeRef(opts.params);

    const pendingRef = ref<Promise<TResult> | null>(null);

    const debounceTime = opts.debounce?.time;
    const debouncedLoad = debounceTime
        ? debounce(loadData, debounceTime, {
              leading: opts.debounce?.leading ?? true,
              trailing: opts.debounce?.trailing ?? true,
          })
        : loadData;

    watch(paramsRef, debouncedLoad, { deep: true });

    return reactive<DataSource<TResult>>({
        value: dataRef,
        pending: pendingRef,
        get,
        reload,
        clear,
    });

    async function get() {
        const pending = pendingRef.value;
        if (pending) {
            return await pending;
        }

        return await reload();
    }

    async function reload() {
        if ('flush' in debouncedLoad) {
            void debouncedLoad();
            return (await debouncedLoad.flush()) as TResult;
        }

        return await debouncedLoad();
    }

    function clear() {
        const pending = pendingRef.value;
        if (pending && isCancelablePromise(pending)) {
            pending.cancel();
        }

        pendingRef.value = null;
        dataRef.value = undefined;
    }

    // function used to load the data
    async function loadData() {
        const pending = pendingRef.value;
        if (pending && isCancelablePromise(pending)) {
            pending.cancel();
        }

        pendingRef.value = null;

        const params = paramsRef.value;
        let promise: Promise<TResult> | undefined;

        try {
            pendingRef.value = promise = opts.load(params);

            const result = await promise;

            dataRef.value = result;
            if (dataCallback) {
                dataCallback(result);
            }

            return result;
        } finally {
            // we need to check if this is really the same request we started
            // because in the meantime some other request might start
            if (pending === promise) {
                pendingRef.value = null;
            }
        }
    }
}
