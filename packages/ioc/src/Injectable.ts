import type { Container } from './Container.js';

export const INJECTABLE_SYMBOL = Symbol('injectable');

/**
 * Infers the type of the injectable.
 */
export type Injected<T> = T extends Injectable ? ReturnType<T['resolve']> : never;

/**
 * Options for the injectable.
 */
export type InjectableOptions<T> = {
    /**
     * Name of the injectable.
     */
    readonly name?: string;
    /**
     * Resolve function.
     */
    readonly resolve: (container: Container, caller?: Injectable) => T;
};

/**
 * Injectable is a type that can be injected into other types.
 */
export type Injectable<T = unknown> = {
    /**
     * Symbol that indicates that the type is an injectable.
     * @internal
     */
    readonly [INJECTABLE_SYMBOL]: true | symbol;
    /**
     * Name of the injectable.
     */
    readonly name?: string;
    /**
     * Resolve function.
     */
    readonly resolve: (container: Container, caller?: Injectable) => T;
};

/**
 * Define an injectable.
 * @param options - Options for the injectable.
 * @returns Injectable.
 */
export function defineInjectable<T>(options: InjectableOptions<T>): Injectable<T> {
    return {
        ...options,
        [INJECTABLE_SYMBOL]: true,
    };
}

/**
 * Check if the value is an injectable.
 * @param value - Value to check.
 * @returns Whether the value is an injectable.
 */
export function isInjectable(value: unknown): value is Injectable {
    if (value == null) {
        return false;
    }

    return (value as Injectable)[INJECTABLE_SYMBOL] !== undefined;
}
