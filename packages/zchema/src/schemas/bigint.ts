import type { Schema, SchemaOptions, SchemaOptionsSimlify } from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { createSchema } from '../createSchema.js';

export type BigintSchema<O extends SchemaOptions<bigint>> = Schema<bigint, O>;

const proto: SchemaProto<bigint> = {
    coerce: BigInt as (value: unknown) => bigint,
    serialize: String,
    check: value => typeof value === 'bigint',
};

export const bigint = defineSchema(
    // eslint-disable-next-line @typescript-eslint/ban-types
    <O extends SchemaOptions<bigint> = {}>(options?: O & SchemaOptions<bigint>) => {
        return createSchema(proto, options) as BigintSchema<SchemaOptionsSimlify<O>>;
    },
);
