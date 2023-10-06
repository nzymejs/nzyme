import debounce from 'lodash.debounce';
import { Ref, ref, watch, toRaw, onBeforeUnmount } from 'vue';

import { createEventEmitter } from '@nzyme/utils';

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

type HistoryState = Record<string, unknown>;

type HistoryEvents = {
    pushState: { state: HistoryState | null };
    replaceState: { state: HistoryState | null };
    popState: { state: HistoryState | null };
};

const history = initializeHistory();

export function historyStateRef<T>(
    options: HistoryStateRefOptions & HistoryStateRefDefault<T>,
): HistoryStateRef<T>;
export function historyStateRef<T>(
    options: HistoryStateRefOptions & HistoryStateRefNoDefault,
): HistoryStateRef<T | null>;

export function historyStateRef<T>(
    options: HistoryStateRefOptions & Partial<HistoryStateRefDefault<T>>,
): HistoryStateRef<T | null> {
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

function initializeHistory() {
    const emitter = createEventEmitter<HistoryEvents>();

    let pushState: History['pushState'];
    let replaceState: History['replaceState'];
    let history: History | null;

    if (typeof window !== 'undefined') {
        history = window.history;

        window.addEventListener('popstate', event => {
            emitter.emit('popState', { state: normalizeState(event.state) });
        });

        // eslint-disable-next-line @typescript-eslint/unbound-method
        pushState = history.pushState;
        history.pushState = (state, title, url) => {
            pushState.call(history, state, title, url);
            emitter.emit('pushState', { state: normalizeState(state) });
        };

        // eslint-disable-next-line @typescript-eslint/unbound-method
        replaceState = window.history.replaceState;
        history.replaceState = (state, title, url) => {
            replaceState.call(history, state, title, url);
            emitter.emit('replaceState', { state: normalizeState(state) });
        };
    }

    return {
        on: emitter.on,
        off: emitter.off,
        getState() {
            if (!history) {
                return null;
            }

            return normalizeState(history.state);
        },
        setState(state: HistoryState) {
            if (replaceState) {
                replaceState.call(history, state, '');
            }
        },
    };
}

function normalizeState(state: unknown) {
    if (!state || typeof state !== 'object') {
        return null;
    }

    return state as Record<string, unknown>;
}
