export function assert<T>(value: T | undefined | null, message?: string): asserts value is T {
    if (value == null) {
        throw new Error(message ?? 'Value is not provided.');
    }
}

export function assertValue<T>(value: T | undefined | null, message?: string): T {
    assert(value, message);
    return value;
}

export function assertEquals<T, E extends T = T>(
    value: T,
    expected: E,
    message?: string,
): asserts value is T {
    if (value !== expected) {
        throw new Error(message ?? `Value is not equal to ${String(expected)}.`);
    }
}
