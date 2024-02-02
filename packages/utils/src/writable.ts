import type { Writable } from '@nzyme/types';

export function writable<T>(value: T) {
    return value as Writable<T>;
}
