import { Dictionary } from '@nzyme/types';

export function objectKeys<T extends {}>(obj: T) {
    return Object.keys(obj) as (keyof T)[];
}

export type ValueOf<T> = Exclude<T[keyof T], undefined>;
