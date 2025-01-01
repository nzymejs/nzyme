import { defineInjectable } from '../Injectable.js';

/**
 * Define a constant value injectable.
 * @param value - Value to define.
 * @returns Constant value injectable.
 */
export function constValue<T>(value: T) {
    return defineInjectable({
        resolve: () => value,
    });
}
