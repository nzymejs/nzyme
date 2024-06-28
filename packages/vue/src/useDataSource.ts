import debounce from 'lodash.debounce';
import { isRef, ref, watch, type Ref } from 'vue';

import { type CancelablePromise, isCancelablePromise } from '@nzyme/utils';

import { makeRef, type RefParam } from './reactivity/makeRef.js';

export interface DataSourceLoader<TParams, TResult> {
    (
        params: TParams,
        oldValue: TResult | undefined,
    ): Promise<TResult> | CancelablePromise<TResult> | TResult;
}

export interface DataSourceOptions<TParams, TResult, TDefault = undefined> {
    /**
     * Request payload - it will be watched for changes to make calls.
     * Can be function or a reference.
     * If undefined is returned, API call will not be made.
     */
    readonly params?: RefParam<TParams>;

    readonly load: DataSourceLoader<TParams, TResult>;

    readonly default?: RefParam<TDefault>;

    readonly immediate?: boolean;

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

export interface DataSource<TResult, TDefault extends TResult | undefined = undefined>
    extends Ref<TResult | TDefault> {
    readonly pending: Promise<TResult> | null;
    readonly get: () => Promise<TResult>;
    readonly reload: () => Promise<TResult>;
    readonly clear: () => void;
}

export function useDataSource<TParams, TResult, TDefault extends TResult | undefined = undefined>(
    opts: DataSourceOptions<TParams, TResult, TDefault>,
) {
    const defaultRef = makeRef(opts.default);
    const dataRef: Ref<TResult | TDefault> = isRef(opts.data)
        ? (opts.data as Ref<TResult | TDefault>)
        : (ref(defaultRef.value) as Ref<TResult | TDefault>);
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

    const dataSource = dataRef as unknown as DataSource<TResult, TDefault>;

    Object.defineProperties(dataSource, {
        pending: { get: () => pendingRef.value },
        get: { value: get },
        reload: { value: reload },
        clear: { value: clear },
    });

    watch(paramsRef, debouncedLoad, { deep: true, immediate: opts.immediate });

    return dataSource;

    async function get() {
        const pending = pendingRef.value;
        if (pending) {
            return await pending;
        }

        if (dataRef.value !== undefined) {
            return dataRef.value;
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
        dataRef.value = defaultRef.value as TDefault;
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
            pendingRef.value = promise = Promise.resolve(
                opts.load(params as TParams, dataRef.value),
            );

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
