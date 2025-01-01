import { INJECTABLE_SYMBOL, isInjectable, type Injectable } from './Injectable.js';

const INTERFACE_SYMBOL = Symbol('interface');

export interface InterfaceOptions {
    name?: string;
}

export type Interface<T = unknown> = Injectable<T> & {
    optional(): Injectable<T | undefined>;
    default(value: T): Injectable<T>;
    default<D>(value: D): Injectable<T | D>;
    default<D>(injectable: Injectable<D>): Injectable<T | D>;
};

export function defineInterface<T>(options: InterfaceOptions = {}): Interface<T> {
    return {
        [INJECTABLE_SYMBOL]: INTERFACE_SYMBOL,
        name: options.name,
        resolve(container, caller) {
            while (container) {
                const value = container.get(this);

                if (value === undefined) {
                    if (container.parent) {
                        container = container.parent;
                        continue;
                    }

                    break;
                }

                if (isInjectable(value)) {
                    return value.resolve(container, caller);
                }

                return value;
            }

            throw new Error(`Interface ${this.name ?? ''} was not found`);
        },
        optional,
        default: defaultValue,
    };
}

export function isInterface(injectable: unknown): injectable is Interface {
    if (injectable == null) {
        return false;
    }

    return (injectable as Interface)[INJECTABLE_SYMBOL] === INTERFACE_SYMBOL;
}

function optional<T>(this: Interface<T>): Injectable<T | undefined> {
    return this.default(undefined);
}

function defaultValue<T, D>(
    this: Interface<T>,
    defaultValue: D | Injectable<D>,
): Injectable<T | D> {
    return {
        [INJECTABLE_SYMBOL]: true,
        name: this.name,
        resolve: (container, caller) => {
            const value = container.get(this);
            if (value === undefined) {
                if (isInjectable(defaultValue)) {
                    return defaultValue.resolve(container, caller);
                }

                return defaultValue;
            }

            if (isInjectable(value)) {
                return value.resolve(container, caller);
            }

            return value;
        },
    };
}
