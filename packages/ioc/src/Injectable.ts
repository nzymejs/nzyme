import type { Container } from './Container.js';

export const INJECTABLE_SYMBOL = Symbol('injectable');

export type Injected<T> = T extends Injectable ? ReturnType<T['resolve']> : never;

export type InjectableOptions<T> = {
    name?: string;
    resolve: (container: Container, caller?: Injectable) => T;
};

export type InjectableResolver<T, TInjectable extends Injectable<T> = Injectable<T>> = (
    this: TInjectable,
    container: Container,
    caller?: Injectable,
) => T;

export type Injectable<T = unknown> = {
    readonly [INJECTABLE_SYMBOL]: true | symbol;
    readonly name?: string;
    resolve(container: Container, caller?: Injectable): T;
};

export function defineInjectable<T>(options: InjectableOptions<T>): Injectable<T> {
    return {
        ...options,
        [INJECTABLE_SYMBOL]: true,
    };
}

export function isInjectable(injectable: unknown): injectable is Injectable {
    if (injectable == null) {
        return false;
    }

    return (injectable as Injectable)[INJECTABLE_SYMBOL] !== undefined;
}
