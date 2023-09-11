import { debounce } from 'lodash';
import { isRef, reactive, ref, watch, Ref } from 'vue';

import { CancelablePromise, isCancelablePromise } from '@nzyme/utils';

import { makeRef, RefParam, unref } from './reactivity/makeRef.js';

export interface DataSourceOptions<T, TResult> {
    /**
     * Request payload - it will be watched for changes to make calls.
     * Can be function or a reference.
     * If undefined is returned, API call will not be made.
     */
    readonly params: RefParam<T | undefined>;

    readonly request: (params: T) => Promise<TResult> | CancelablePromise<TResult>;

    /** Options for debouncing */
    readonly debounce?: {
        /** Number of milliseconds to debounce api calls */
        time?: number;
        leading?: boolean;
        trailing?: boolean;
    };

    /** Data will be loaded into this ref. Optional. */
    readonly data?: ((result: TResult) => void) | Ref<TResult | null>;

    /** Loading flag will be updated into this ref. Optional. */
    readonly loading?: Ref<boolean>;
}

export interface DataSource<T> {
    readonly data: T | null;
    readonly loading: boolean;
    reload(): Promise<T | null>;
}

export function useDataSource<T, TResult>(opts: DataSourceOptions<T, TResult>) {
    let pending: Promise<TResult> | CancelablePromise<TResult> | undefined;

    const dataRef: Ref<TResult | null> = isRef(opts.data) ? opts.data : ref(null);
    const dataCallback = isRef(opts.data) ? null : opts.data;
    const paramsRef = makeRef(opts.params);

    const loadingRef = opts.loading ?? ref<boolean>(false);

    loadingRef.value = false;

    const debounceTime = opts.debounce?.time ?? 300;
    const debouncedLoad = debounce(loadData, debounceTime, {
        leading: opts.debounce?.leading ?? true,
        trailing: opts.debounce?.trailing ?? true,
    });

    watch(paramsRef, debouncedLoad, { deep: true });

    return reactive({
        data: unref(dataRef),
        loading: unref(loadingRef),
        reload() {
            void debouncedLoad();
            return debouncedLoad.flush();
        },
    }) as DataSource<TResult>;

    // function used to load the data
    async function loadData() {
        if (pending && isCancelablePromise(pending)) {
            pending.cancel();
        }
        pending = undefined;

        const params = paramsRef.value;
        if (params === undefined) {
            return null;
        }

        let promise: Promise<TResult> | undefined;

        try {
            pending = promise = opts.request(params);

            loadingRef.value = true;

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
                pending = undefined;

                loadingRef.value = false;
            }
        }
    }
}
