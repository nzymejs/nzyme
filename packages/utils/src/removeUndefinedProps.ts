import { DefinedProperties } from '@nzyme/types';

/**
 * Removes props that are undefined.
 * @deprecated use @see skipUndefinedProps
 */
export function removeUndefinedProps<T extends object>(obj: T): T {
    for (const prop in obj) {
        if (obj[prop] === undefined) {
            delete obj[prop];
        }
    }

    return obj;
}

/**
 * Returns only props that are defined.
 */
export function skipUndefinedProps<T extends object>(obj: T): DefinedProperties<T> {
    const result = {} as Record<string, unknown>;

    for (const prop in obj) {
        if (obj[prop] !== undefined) {
            result[prop] = obj[prop];
        }
    }

    return result as DefinedProperties<T>;
}
