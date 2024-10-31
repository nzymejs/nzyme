import { onScopeDispose } from 'vue';

import type { EventEmitter, EventEmitterCallback, EventEmitterEvents } from '@nzyme/utils';

export function onEventEmitter<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TEmitter extends EventEmitter<any>,
    E extends keyof EventEmitterEvents<TEmitter>,
>(emitter: TEmitter, event: E, callback: EventEmitterCallback<EventEmitterEvents<TEmitter>, E>) {
    emitter.on(event, callback);
    onScopeDispose(() => emitter.off(event, callback));
}
