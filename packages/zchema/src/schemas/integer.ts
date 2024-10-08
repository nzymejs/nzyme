import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type IntegerSchema<O extends SchemaOptions<number>> = Schema<number, O>;

const proto: SchemaProto<number> = {
    coerce: v => Math.ceil(Number(v)),
    serialize: identity,
    check: Number.isInteger as (value: unknown) => value is number,
    default: () => 0,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function integer<O extends SchemaOptions<number> = {}>(
    options?: O & SchemaOptions<number>,
): IntegerSchema<SchemaOptionsSimlify<O>> {
    return createSchema(proto, options) as IntegerSchema<SchemaOptionsSimlify<O>>;
}
