import type { Primitive } from '@nzyme/types';
import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

// eslint-disable-next-line @typescript-eslint/ban-types
export type EnumSchemaOptions<V extends Primitive[] = Primitive[]> = SchemaOptions<V[number]> & {
    values: V;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnumSchema<O extends EnumSchemaOptions> = ForceName<Schema<O['values'][number], O>>;

declare class FF {}
type ForceName<T> = T & FF;

export type EnumSchemaValue<O extends EnumSchemaOptions> = O['values'][number];

export function enumSchema<const V extends Primitive[], O extends EnumSchemaOptions<V>>(
    options: O & EnumSchemaOptions<V>,
) {
    const values = options.values;
    const valuesSet = new Set(values);

    type Value = EnumSchemaValue<O>;

    const proto: SchemaProto<Value> = {
        coerce(value) {
            if (valuesSet.has(value as Value)) {
                return value as Value;
            }

            return values[0];
        },
        serialize: identity,
        check(value): value is Value {
            return valuesSet.has(value as Value);
        },
        default: () => values[0],
    };

    return createSchema<EnumSchemaValue<O>>(
        proto,
        options as SchemaOptions<EnumSchemaValue<O>>,
    ) as EnumSchema<SchemaOptionsSimlify<O>>;
}
