import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify } from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { createSchema } from '../createSchema.js';

export type BooleanSchema<O extends SchemaOptions<boolean>> = Schema<boolean, O>;

const proto: SchemaProto<boolean> = {
    coerce: Boolean,
    serialize: identity,
    check: value => typeof value === 'boolean',
};

export const boolean = defineSchema(
    // eslint-disable-next-line @typescript-eslint/ban-types
    <O extends SchemaOptions<boolean> = {}>(options?: O & SchemaOptions<boolean>) => {
        return createSchema(proto, options) as BooleanSchema<SchemaOptionsSimlify<O>>;
    },
);
