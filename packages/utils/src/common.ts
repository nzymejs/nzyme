import { Writable } from '@nzyme/types';

export function noop(...args: any[]) {
    //
}

export function assert<T>(value: T | undefined | null, message?: string): asserts value is T {
    if (value == null) {
        throw new Error(message ?? 'Value is not provided.');
    }
}

export function assertValue<T>(value: T | undefined | null): T {
    assert(value);
    return value;
}

export function writable<T>(value: T) {
    return value as Writable<T>;
}
