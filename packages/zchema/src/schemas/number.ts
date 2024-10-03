import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify } from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { createSchema } from '../createSchema.js';

export type NumberSchema<O extends SchemaOptions<number>> = Schema<number, O>;

const proto: SchemaProto<number> = {
    coerce: Number,
    serialize: identity,
};

export const number = defineSchema(
    // eslint-disable-next-line @typescript-eslint/ban-types
    <O extends SchemaOptions<number> = {}>(options?: O & SchemaOptions<number>) => {
        return createSchema(proto, options) as NumberSchema<SchemaOptionsSimlify<O>>;
    },
);
