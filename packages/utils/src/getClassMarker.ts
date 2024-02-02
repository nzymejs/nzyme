import type { AbstractConstructor } from '@nzyme/types';

type MarkedClass = AbstractConstructor & {
    [marker: symbol]: symbol | undefined;
};

/**
 * Returns a symbol unique for each class.
 * Useful if you want to use class as a map key.
 */
export function getClassMarker(cls: AbstractConstructor, symbol: symbol) {
    const marked = cls as MarkedClass;

    if (!marked.hasOwnProperty(symbol)) {
        return (marked[symbol] = Symbol(cls.name));
    }

    return marked[symbol] || (marked[symbol] = Symbol(cls.name));
}
