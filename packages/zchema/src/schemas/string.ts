import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify } from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { createSchema } from '../createSchema.js';

export type StringSchema<O extends SchemaOptions<string>> = Schema<string, O>;

const proto: SchemaProto<string> = {
    coerce: String,
    serialize: identity,
};

export const string = defineSchema(
    // eslint-disable-next-line @typescript-eslint/ban-types
    <O extends SchemaOptions<string> = {}>(options?: O & SchemaOptions<string>) => {
        return createSchema(proto, options) as StringSchema<SchemaOptionsSimlify<O>>;
    },
);
