export function createMemo<T>(factory: () => T) {
    let value: T;

    return () => {
        if (value === undefined) {
            value = factory();
        }

        return value;
    };
}
