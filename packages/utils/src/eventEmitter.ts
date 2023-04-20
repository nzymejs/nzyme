import { IfLiteral } from '@nzyme/types';

export type EventCallbackAsync<TEvents, E extends keyof TEvents> = TEvents[E] extends void
    ? () => void | Promise<void>
    : (event: TEvents[E]) => void | Promise<void>;

export type EventEmitterAsync<TEvents> = ReturnType<typeof eventEmitterAsync<TEvents>>;
export type EventEmitterAsyncReadonly<TEvents> = Pick<EventEmitterAsync<TEvents>, 'on'>;

type PredefinedEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, E, never>]: TEvents[E];
};

type GenericEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, never, E>]: TEvents[E];
};

export function eventEmitterAsync<TEvents>() {
    type Callback = EventCallbackAsync<TEvents, keyof TEvents>;
    const listeners = new Map<keyof TEvents, Callback[]>();

    return {
        on,
        emit,
    };

    function on<E extends keyof PredefinedEvents<TEvents>>(
        event: E,
        callback: EventCallbackAsync<TEvents, E>,
    ): void;
    function on<E extends keyof GenericEvents<TEvents>>(
        event: E,
        callback: EventCallbackAsync<TEvents, E>,
    ): void;
    function on<E extends keyof TEvents>(event: E, callback: EventCallbackAsync<TEvents, E>) {
        let callbacks = listeners.get(event);
        if (!callbacks) {
            callbacks = [];
            listeners.set(event, callbacks);
        }

        callbacks.push(callback as Callback);
    }

    async function emit<E extends keyof PredefinedEvents<TEvents>>(
        event: E,
        value: TEvents[E],
    ): Promise<void>;
    async function emit<E extends keyof GenericEvents<TEvents>>(
        event: E,
        value: TEvents[E],
    ): Promise<void>;
    async function emit<E extends keyof TEvents>(event: E, value: TEvents[E]): Promise<void> {
        const callbacks = listeners.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            await callback(value);
        }
    }
}
