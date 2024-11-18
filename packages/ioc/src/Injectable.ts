export const INJECTABLE_SYMBOL = Symbol('injectable');
declare const s: unique symbol;

export interface InjectableOptions {
    name?: string;
}

export type InjectableKey<T> = symbol & { [s]: T };

export type InjectableOf<T> = T extends Injectable<infer U> ? U : never;

export interface Injectable<T = unknown> {
    readonly [INJECTABLE_SYMBOL]: true;
    readonly name?: string;
    readonly key: InjectableKey<T>;
}

export function defineInjectable<T, TOptions extends InjectableOptions = InjectableOptions>(
    options: TOptions = {} as TOptions,
): Injectable<T> & TOptions {
    return Object.freeze({
        ...options,
        [INJECTABLE_SYMBOL]: true,
        key: Symbol(options?.name) as InjectableKey<T>,
    });
}

export function isInjectable(injectable: unknown): injectable is Injectable {
    if (injectable == null) {
        return false;
    }

    return (injectable as Injectable)[INJECTABLE_SYMBOL] === true;
}
