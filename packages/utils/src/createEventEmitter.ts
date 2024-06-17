import type { IfLiteral, NonVoidPropKeys, VoidPropKeys } from '@nzyme/types';

import { arrayRemove } from './array/arrayRemove.js';

export type EventEmitterCallback<TEvents, E extends keyof TEvents> = TEvents[E] extends void
    ? () => void | Promise<void>
    : (event: TEvents[E]) => void | Promise<void>;

export type EventEmitterPrivate<TEvents> = ReturnType<typeof createEventEmitter<TEvents>>;
export type EventEmitterPublic<TEvents> = Pick<EventEmitterPrivate<TEvents>, 'on' | 'off'>;

type PredefinedEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, E, never>]: TEvents[E];
};

type GenericEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, never, E>]: TEvents[E];
};

export function createEventEmitter<TEvents>() {
    type Callback = EventEmitterCallback<TEvents, keyof TEvents>;
    const listeners = new Map<keyof TEvents, Callback[]>();

    return {
        on,
        off,
        emit,
        emitAsync,
    };

    function on<E extends keyof PredefinedEvents<TEvents>>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function on<E extends keyof GenericEvents<TEvents>>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function on<E extends keyof TEvents>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function on<E extends keyof TEvents>(event: E, callback: EventEmitterCallback<TEvents, E>) {
        let callbacks = listeners.get(event);
        if (!callbacks) {
            callbacks = [];
            listeners.set(event, callbacks);
        }

        callbacks.push(callback as Callback);
    }

    function off<E extends keyof PredefinedEvents<TEvents>>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function off<E extends keyof GenericEvents<TEvents>>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function off<E extends keyof TEvents>(
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    function off<E extends keyof TEvents>(event: E, callback: EventEmitterCallback<TEvents, E>) {
        const callbacks = listeners.get(event);
        if (callbacks) {
            arrayRemove(callbacks, callback as Callback);
        }
    }

    function emit<E extends keyof TEvents & VoidPropKeys<PredefinedEvents<TEvents>>>(
        event: E,
    ): void;
    function emit<E extends keyof TEvents & NonVoidPropKeys<PredefinedEvents<TEvents>>>(
        event: E,
        value: TEvents[E],
    ): void;
    function emit<E extends keyof TEvents & VoidPropKeys<GenericEvents<TEvents>>>(event: E): void;
    function emit<E extends keyof TEvents & NonVoidPropKeys<GenericEvents<TEvents>>>(
        event: E,
        value: TEvents[E],
    ): void;
    function emit<E extends keyof TEvents>(event: E, value?: TEvents[E]): void {
        const callbacks = listeners.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            void callback(value as TEvents[E]);
        }
    }

    function emitAsync<E extends keyof TEvents & VoidPropKeys<PredefinedEvents<TEvents>>>(
        event: E,
    ): Promise<void>;
    function emitAsync<E extends keyof TEvents & NonVoidPropKeys<PredefinedEvents<TEvents>>>(
        event: E,
        value: TEvents[E],
    ): Promise<void>;
    function emitAsync<E extends keyof TEvents & VoidPropKeys<GenericEvents<TEvents>>>(
        event: E,
    ): void;
    function emitAsync<E extends keyof TEvents & NonVoidPropKeys<GenericEvents<TEvents>>>(
        event: E,
        value: TEvents[E],
    ): Promise<void>;
    async function emitAsync<E extends keyof TEvents>(event: E, value?: TEvents[E]): Promise<void> {
        const callbacks = listeners.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            await callback(value as TEvents[E]);
        }
    }
}
