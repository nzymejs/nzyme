import type { SomeObject } from '@nzyme/types';

export function objectKeys<T extends SomeObject>(obj: T) {
    return Object.keys(obj) as (keyof T)[];
}
