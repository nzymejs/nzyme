import { isIterable } from '@nzyme/utils';

import type {
    Schema,
    SchemaAny,
    SchemaOptions,
    SchemaOptionsSimlify,
    SchemaProto,
    SchemaValue,
} from '../Schema.js';
import { coerce } from '../coerce.js';
import { createSchema } from '../createSchema.js';
import { serialize } from '../serialize.js';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArraySchemaOptions<T extends SchemaAny = SchemaAny> = SchemaOptions<
    SchemaValue<T>[]
> & {
    of: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArraySchema<O extends ArraySchemaOptions> = ForceName<
    O extends ArraySchemaOptions<infer T extends SchemaAny> ? Schema<SchemaValue<T>[], O> : never
>;

declare class FF {}
type ForceName<T> = T & FF;

export type ArraySchemaValue<O extends ArraySchemaOptions> = SchemaValue<O['of']>[];

export function array<O extends ArraySchemaOptions>(options: O & ArraySchemaOptions<O['of']>) {
    const itemSchema = options.of;

    const proto: SchemaProto<ArraySchemaValue<O>> = {
        coerce(value) {
            const result: ArraySchemaValue<O> = [];

            if (!isIterable(value)) {
                return result;
            }

            for (const item of value) {
                result.push(coerce(itemSchema, item));
            }

            return result;
        },
        serialize(value) {
            const result: unknown[] = [];

            for (const item of value) {
                result.push(serialize(itemSchema, item));
            }

            return result;
        },
        check(value): value is ArraySchemaValue<O> {
            return Array.isArray(value);
        },
        default: () => [],
    };

    return createSchema<ArraySchemaValue<O>>(
        proto,
        options as SchemaOptions<ArraySchemaValue<O>>,
    ) as ArraySchema<SchemaOptionsSimlify<O>>;
}
