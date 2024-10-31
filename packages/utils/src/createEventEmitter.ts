import type { IfLiteral, NonVoidPropKeys, VoidPropKeys } from '@nzyme/types';

import { arrayRemove } from './array/arrayRemove.js';

type PredefinedEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, E, never>]: TEvents[E];
};

type GenericEvents<TEvents> = {
    [E in keyof TEvents as IfLiteral<E, never, E>]: TEvents[E];
};

export type EventEmitterCallback<TEvents, E extends keyof TEvents> = TEvents[E] extends void
    ? () => void | Promise<unknown>
    : (event: TEvents[E]) => void | Promise<unknown>;

export type EventEmitterEvents<TEmitter> =
    TEmitter extends EventEmitter<infer TEvents> ? TEvents : never;

export type EventEmitterPublic<TEvents> = {
    on<E extends keyof PredefinedEvents<TEvents>>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    on<E extends keyof GenericEvents<TEvents>>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    on<E extends keyof TEvents>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;

    off<E extends keyof PredefinedEvents<TEvents>>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    off<E extends keyof GenericEvents<TEvents>>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
    off<E extends keyof TEvents>(
        this: void,
        event: E,
        callback: EventEmitterCallback<TEvents, E>,
    ): void;
};

export type EventEmitter<TEvents> = EventEmitterPublic<TEvents> & {
    emit<E extends keyof TEvents & VoidPropKeys<PredefinedEvents<TEvents>>>(
        this: void,
        event: E,
    ): void;
    emit<E extends keyof TEvents & NonVoidPropKeys<PredefinedEvents<TEvents>>>(
        this: void,
        event: E,
        value: TEvents[E],
    ): void;
    emit<E extends keyof TEvents & VoidPropKeys<GenericEvents<TEvents>>>(event: E): void;
    emit<E extends keyof TEvents & NonVoidPropKeys<GenericEvents<TEvents>>>(
        this: void,
        event: E,
        value: TEvents[E],
    ): void;

    emitAsync<E extends keyof TEvents & VoidPropKeys<PredefinedEvents<TEvents>>>(
        this: void,
        event: E,
    ): Promise<void>;
    emitAsync<E extends keyof TEvents & NonVoidPropKeys<PredefinedEvents<TEvents>>>(
        this: void,
        event: E,
        value: TEvents[E],
    ): Promise<void>;
    emitAsync<E extends keyof TEvents & VoidPropKeys<GenericEvents<TEvents>>>(
        this: void,
        event: E,
    ): void;
    emitAsync<E extends keyof TEvents & NonVoidPropKeys<GenericEvents<TEvents>>>(
        this: void,
        event: E,
        value: TEvents[E],
    ): Promise<void>;
};

export function createEventEmitter<TEvents>(): EventEmitter<TEvents> {
    type Callback = EventEmitterCallback<TEvents, keyof TEvents>;
    const listeners = new Map<keyof TEvents, Callback[]>();

    return {
        on,
        off,
        emit,
        emitAsync,
    };

    function on<E extends keyof TEvents>(event: E, callback: EventEmitterCallback<TEvents, E>) {
        let callbacks = listeners.get(event);
        if (!callbacks) {
            callbacks = [];
            listeners.set(event, callbacks);
        }

        callbacks.push(callback as Callback);
    }

    function off<E extends keyof TEvents>(event: E, callback: EventEmitterCallback<TEvents, E>) {
        const callbacks = listeners.get(event);
        if (callbacks) {
            arrayRemove(callbacks, callback as Callback);
        }
    }

    function emit<E extends keyof TEvents>(event: E, value?: TEvents[E]): void {
        const callbacks = listeners.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            void callback(value as TEvents[E]);
        }
    }

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
