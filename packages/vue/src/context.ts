import { inject, provide, UnwrapRef } from 'vue';

export interface ContextConstructor<TParams extends unknown[], TContext extends object> {
    (this: undefined, ...params: TParams): TContext;
}

export interface ContextDefinition<TParams extends unknown[], TContext extends object> {
    readonly constructor: ContextConstructor<TParams, TContext>;
    readonly symbol: symbol;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextOf<T> = T extends ContextDefinition<any, infer TContext>
    ? UnwrapRef<TContext>
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextParams<T> = T extends ContextDefinition<infer TParams, any> ? TParams : never;

export function defineContext<TParams extends unknown[], TContext extends object>(
    context: ContextConstructor<TParams, TContext>,
): ContextDefinition<TParams, TContext> {
    return {
        constructor: context,
        symbol: Symbol(),
    };
}

export function provideContext<TParams extends unknown[], TContext extends object>(
    context: ContextDefinition<TParams, TContext>,
    ...params: TParams
) {
    const instance = context.constructor.apply(undefined, params);
    provide(context.symbol, instance);
    return instance;
}

export function injectContext<TParams extends unknown[], TContext extends object>(
    context: ContextDefinition<TParams, TContext>,
): UnwrapRef<TContext>;
export function injectContext<TParams extends unknown[], TContext extends object>(
    context: ContextDefinition<TParams, TContext>,
    opts: { optional: boolean },
): UnwrapRef<TContext> | null;
export function injectContext<TParams extends unknown[], TContext extends object>(
    context: ContextDefinition<TParams, TContext>,
    opts?: { optional: boolean },
): UnwrapRef<TContext> | null {
    const instance = inject<UnwrapRef<TContext> | null>(context.symbol, null);
    if (!instance) {
        if (opts?.optional) {
            return null;
        }

        throw new Error(`Context was not registered`);
    }

    return instance;
}
