/**
 * Removes props that are undefined.
 */
export function removeUndefinedProps<T extends object>(obj: T): T {
    for (const prop in obj) {
        if (obj[prop] === undefined) {
            delete obj[prop];
        }
    }

    return obj;
}
