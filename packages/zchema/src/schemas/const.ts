import type { Primitive } from '@nzyme/types';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ConstSchemaOptions<V = unknown> = SchemaOptions<V> & {
    value: V;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConstSchema<O extends ConstSchemaOptions> = ForceName<Schema<O['value'], O>>;

declare class FF {}
type ForceName<T> = T & FF;

export function constSchema<const V extends Primitive[], O extends ConstSchemaOptions<V>>(
    options: O & ConstSchemaOptions<V>,
) {
    const value = options.value;

    const proto: SchemaProto<O['value']> = {
        coerce: () => value,
        serialize: () => value,
        check(value): value is O['value'] {
            return value === value;
        },
        default: () => value,
    };

    return createSchema<O['value']>(proto, options as SchemaOptions<O['value']>) as ConstSchema<
        SchemaOptionsSimlify<O>
    >;
}
