import { capitalize } from '@vue/runtime-core';

import { useInstance } from './useInstance';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEmitAsync<T extends EmitFn<any, any[]>>(emit: T): EmitFnToAsync<T>;
export function useEmitAsync(): EmitFnToAsync<EmitFn>;
export function useEmitAsync<T extends EmitFn>(emit?: T): EmitFnToAsync<T> {
    const instance = useInstance();

    const emitAsync: EmitFnToAsync<EmitFn> = async (event, ...args) => {
        const attrName = 'on' + capitalize(event);
        const listeners = instance.vnode.props?.[attrName];

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

    return emitAsync as EmitFnToAsync<T>;
}

type EmitFn<TEvent extends string = string, TArgs extends unknown[] = unknown[]> = (
    event: TEvent,
    ...args: TArgs
) => unknown;

type EmitFnToAsync<T extends EmitFn> = T extends EmitFn<infer TEvent, infer TArgs>
    ? (event: TEvent, ...args: TArgs) => Promise<void>
    : never;
