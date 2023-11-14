import { arrayRemove } from './array/arrayRemove.js';

export type EventCallback<TEvent = void> = TEvent extends void
    ? () => void | Promise<void>
    : (event: TEvent) => void | Promise<void>;

export type EventEmitterSingle<TEvent = void> = {
    on(this: void, callback: EventCallback<TEvent>): void;
    off(this: void, callback: EventCallback<TEvent>): void;
    emit(this: void, event: TEvent): void;
    emitAsync(this: void, event: TEvent): Promise<void>;
};

export function createSingleEventEmitter<TEvent = void>(): EventEmitterSingle<TEvent> {
    type Callback = EventCallback<TEvent>;
    const listeners: Callback[] = [];

    return {
        on,
        off,
        emit,
        emitAsync,
    };

    function on(callback: Callback): void {
        listeners.push(callback);
    }

    function off(callback: Callback) {
        arrayRemove(listeners, callback);
    }

    function emit(event: TEvent): void {
        for (const callback of listeners) {
            void callback(event);
        }
    }

    async function emitAsync(event: TEvent): Promise<void> {
        for (const callback of listeners) {
            await callback(event);
        }
    }
}
