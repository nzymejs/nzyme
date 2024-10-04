import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type BooleanSchema<O extends SchemaOptions<boolean>> = Schema<boolean, O>;

const proto: SchemaProto<boolean> = {
    coerce: Boolean,
    serialize: identity,
    check: value => typeof value === 'boolean',
    default: () => false,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function boolean<O extends SchemaOptions<boolean> = {}>(
    options?: O & SchemaOptions<boolean>,
) {
    return createSchema(proto, options) as BooleanSchema<SchemaOptionsSimlify<O>>;
}
