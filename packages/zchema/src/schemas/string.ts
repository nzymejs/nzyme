import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { defineSchema } from '../defineSchema.js';

export type StringSchema<O extends SchemaOptions<string>> = Schema<string, O>;

const proto: SchemaProto<string> = {
    coerce: String,
    serialize: identity,
    check: value => typeof value === 'string',
    default: () => '',
};

type StringSchemaBase = {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    <O extends SchemaOptions<string> = {}>(
        options?: O & SchemaOptions<string>,
    ): StringSchema<SchemaOptionsSimlify<O>>;
};

export const string = defineSchema<StringSchemaBase>({
    proto: () => proto,
});
