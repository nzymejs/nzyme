import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type NumberSchema<O extends SchemaOptions<number>> = Schema<number, O>;

const proto: SchemaProto<number> = {
    coerce: Number,
    serialize: identity,
    check: value => typeof value === 'number',
    default: () => 0,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function number<O extends SchemaOptions<number> = {}>(
    options?: O & SchemaOptions<number>,
): NumberSchema<SchemaOptionsSimlify<O>> {
    return createSchema(proto, options) as NumberSchema<SchemaOptionsSimlify<O>>;
}
