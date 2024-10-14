import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type UnknownSchema<V, O extends SchemaOptions<V>> = ForceName<Schema<V, O>>;

declare class FF {}
type ForceName<T> = T & FF;

const proto: SchemaProto<unknown> = {
    coerce: identity,
    serialize: identity,
    check(value): value is unknown {
        return true;
    },
    default: () => null,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function unknown<V = unknown, O extends SchemaOptions<V> = {}>(
    options?: O & SchemaOptions<V>,
) {
    return createSchema<V>(proto as SchemaProto<V>, options) as UnknownSchema<
        V,
        SchemaOptionsSimlify<O>
    >;
}
