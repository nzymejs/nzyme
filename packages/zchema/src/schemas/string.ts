import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type StringSchema<O extends SchemaOptions<string>> = Schema<string, O>;

const proto: SchemaProto<string> = {
    coerce: String,
    serialize: identity,
    check: value => typeof value === 'string',
    default: () => '',
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function string<O extends SchemaOptions<string> = {}>(options?: O & SchemaOptions<string>) {
    return createSchema(proto, options) as StringSchema<SchemaOptionsSimlify<O>>;
}
