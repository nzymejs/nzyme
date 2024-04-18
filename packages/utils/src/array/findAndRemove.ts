export function findAndRemove<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
    const index = array.findIndex(predicate);
    if (index < 0) {
        return undefined;
    }

    return array.splice(index, 1)[0];
}
