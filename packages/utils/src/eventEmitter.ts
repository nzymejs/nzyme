type EventCallbackAsync<TEvents, E extends keyof TEvents> = TEvents[E] extends void
    ? () => void | Promise<void>
    : (event: TEvents[E]) => void | Promise<void>;

export function eventEmitterAsync<TEvents>() {
    type Callback = EventCallbackAsync<TEvents, keyof TEvents>;
    const listeners = new Map<keyof TEvents, Callback[]>();

    return {
        on,
        emit,
    };

    function on<E extends keyof TEvents>(event: E, callback: EventCallbackAsync<TEvents, E>) {
        let callbacks = listeners.get(event);
        if (!callbacks) {
            callbacks = [];
            listeners.set(event, callbacks);
        }

        callbacks.push(callback as Callback);
    }

    async function emit<E extends keyof TEvents>(event: E, value: TEvents[E]) {
        const callbacks = listeners.get(event);
        if (!callbacks) {
            return;
        }

        for (const callback of callbacks) {
            await callback(value);
        }
    }
}
