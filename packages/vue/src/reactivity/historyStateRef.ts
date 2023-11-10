import debounce from 'lodash.debounce';
import { type Ref, ref, watch, toRaw, onBeforeUnmount } from 'vue';

import { useHistory } from '../useHistory.js';

export interface HistoryStateRef<T> extends Ref<T> {
    save(): void;
}

type HistoryStateRefOptions = {
    key: string;
    deep?: boolean;
    debounce?: number;
};

type HistoryStateRefNoDefault = {
    default?: never;
};

type HistoryStateRefDefault<T> = {
    default: () => T;
};

export function historyStateRef<T>(
    options: HistoryStateRefOptions & HistoryStateRefDefault<T>,
): HistoryStateRef<T>;
export function historyStateRef<T>(
    options: HistoryStateRefOptions & HistoryStateRefNoDefault,
): HistoryStateRef<T | null>;

export function historyStateRef<T>(
    options: HistoryStateRefOptions & Partial<HistoryStateRefDefault<T>>,
): HistoryStateRef<T | null> {
    const history = useHistory();
    const key = options.key;

    const historyRef = ref<T>(read()) as HistoryStateRef<T>;
    historyRef.save = save;

    watch(historyRef, options.debounce ? debounce(write, options.debounce) : write);

    history.on('popState', update);
    onBeforeUnmount(() => history.off('popState', update));

    return historyRef;

    function update() {
        historyRef.value = read();
    }

    function read() {
        const state = history.getState();

        if (!state) {
            return getDefault();
        }

        return (state[key] as T | undefined) ?? getDefault();
    }

    function write(value: T | null) {
        if (!history) {
            return;
        }

        const state = history.getState() ?? {};
        state[key] = toRaw(value);
        history.setState(state);
    }

    function getDefault() {
        if (options.default) {
            return options.default();
        }

        return null as T;
    }

    function save() {
        write(historyRef.value);
    }
}
