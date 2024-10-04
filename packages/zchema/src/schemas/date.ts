import type { Schema, SchemaOptions, SchemaOptionsSimlify } from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { createSchema } from '../createSchema.js';

export type DateSchema<O extends SchemaOptions<Date>> = Schema<Date, O>;

const proto: SchemaProto<Date> = {
    coerce: val => new Date(val as string | number),
    serialize: date => date.toISOString(),
    check: value => value instanceof Date,
};

export const date = defineSchema(
    // eslint-disable-next-line @typescript-eslint/ban-types
    <O extends SchemaOptions<Date> = {}>(options?: O & SchemaOptions<Date>) => {
        return createSchema(proto, options) as DateSchema<SchemaOptionsSimlify<O>>;
    },
);
