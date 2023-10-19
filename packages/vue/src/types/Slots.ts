import { SomeObject } from '@nzyme/types';

export type Slots<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: (props: undefined extends T[K] ? SomeObject : T[K]) => any;
};
