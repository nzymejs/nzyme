import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type BigintSchema<O extends SchemaOptions<bigint>> = Schema<bigint, O>;

const proto: SchemaProto<bigint> = {
    coerce: BigInt as (value: unknown) => bigint,
    serialize: String,
    check: value => typeof value === 'bigint',
    default: () => 0n,
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function bigint<O extends SchemaOptions<bigint> = {}>(options?: O & SchemaOptions<bigint>) {
    return createSchema(proto, options) as BigintSchema<SchemaOptionsSimlify<O>>;
}
