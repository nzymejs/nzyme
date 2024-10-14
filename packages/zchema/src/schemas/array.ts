import { isIterable } from '@nzyme/utils';

import type {
    Schema,
    SchemaAny,
    SchemaOptions,
    SchemaOptionsSimlify,
    SchemaProto,
    SchemaValue,
} from '../Schema.js';
import { createSchema } from '../createSchema.js';
import { coerce } from '../utils/coerce.js';
import { isSchema } from '../utils/isSchema.js';
import { serialize } from '../utils/serialize.js';

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

export function array<S extends SchemaAny>(of: S): ArraySchema<{ of: S }>;
export function array<O extends ArraySchemaOptions>(
    options: O & ArraySchemaOptions<O['of']>,
): ArraySchema<SchemaOptionsSimlify<O>>;
export function array(optionsOrSchema: SchemaAny | ArraySchemaOptions) {
    const options = isSchema(optionsOrSchema) ? { of: optionsOrSchema } : optionsOrSchema;
    const itemSchema = options.of;

    const proto: SchemaProto<unknown[]> = {
        coerce(value) {
            const result: unknown[] = [];

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
        check(value): value is unknown[] {
            return Array.isArray(value);
        },
        default: () => [],
        visit(value, visitor) {
            for (let i = 0; i < value.length; i++) {
                visitor(itemSchema, value[i], i);
            }
        },
    };

    return createSchema<unknown[]>(proto, options) as ArraySchema<ArraySchemaOptions>;
}
