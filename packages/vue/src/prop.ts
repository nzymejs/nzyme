import type { PropType, Prop } from 'vue';

import type { AbstractConstructor, IfPropertyOptional, Simplify } from '@nzyme/types';

type PropOptionsPartial<T> = Omit<Prop<T>, 'required' | 'type'>;
type PropOptionsRequired<T> = Prop<T> & { required: true };
type PropOptionsOptional<T> = Prop<T> & { required: false };

export function prop<T>(type?: PropType<T>): PropBuilder<T>;
export function prop<T>(type?: AbstractConstructor<T>): PropBuilder<T>;
export function prop<T>(type?: PropType<T> | AbstractConstructor<T>): PropBuilder<T> {
    return {
        optional(opts) {
            return {
                ...opts,
                type: type as PropType<T> | undefined,
                required: false,
            };
        },
        required(opts) {
            return {
                ...opts,
                type: type as PropType<T> | undefined,
                required: true,
            };
        },
    };
}

interface PropBuilder<T> {
    optional(opts?: PropOptionsPartial<T>): PropOptionsOptional<T>;
    required(opts?: PropOptionsPartial<T>): PropOptionsRequired<T>;
}

export type PropOptions<P> = Simplify<{
    [K in keyof P]-?: IfPropertyOptional<
        P,
        K,
        PropOptionsOptional<P[K]>,
        PropOptionsRequired<P[K]>
    >;
}>;
