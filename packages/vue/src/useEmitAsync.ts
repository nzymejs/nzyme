import { capitalize } from 'vue';

import { RecordToUnion, UnionToIntersection } from '@nzyme/types';

import { useInstance } from './useInstance.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEmitAsync<T extends EmitFn<any, any[]>>(emit: T): EmitFnToAsync<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEmitAsync<E extends Record<string, any[]>>(): ShortEmits<E>;
export function useEmitAsync() {
    const instance = useInstance();

    const emitAsync: EmitFnToAsync<EmitFn<string, unknown[]>> = async (event, ...args) => {
        const attrName = 'on' + capitalize(event);

        type Listener = (...args: unknown[]) => unknown;
        const listeners = instance.vnode.props?.[attrName] as Listener[] | Listener | undefined;

        if (!listeners) {
            return;
        }

        if (Array.isArray(listeners)) {
            const promises: unknown[] = [];
            for (const listener of listeners) {
                if (typeof listener === 'function') {
                    promises.push(listener(...args));
                }
            }

            // there are many listeners for this event
            await Promise.all(promises);
        } else if (typeof listeners === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await listeners(...args);
        }
    };

    return emitAsync;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
    RecordToUnion<{
        [K in keyof T]: (evt: K, ...args: T[K]) => Promise<void>;
    }>
>;

type EmitFn<TEvent extends string, TArgs extends unknown[] = unknown[]> = (
    event: TEvent,
    ...args: TArgs
) => unknown;

type EmitFnAsync<TEvent extends string, TArgs extends unknown[] = unknown[]> = (
    event: TEvent,
    ...args: TArgs
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmitFnToAsync<T extends EmitFn<any, any>> = T extends EmitFn<infer TEvent, infer TArgs>
    ? EmitFnAsync<TEvent, TArgs>
    : never;
