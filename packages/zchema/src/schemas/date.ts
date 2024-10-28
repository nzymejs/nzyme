import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { defineSchema } from '../defineSchema.js';

export type DateSchema<O extends SchemaOptions<Date>> = Schema<Date, O>;

const proto: SchemaProto<Date> = {
    coerce: val => new Date(val as string | number),
    serialize: date => date.toISOString(),
    check: value => value instanceof Date,
    default: () => new Date(0),
};

type DateSchemaBase = {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    <O extends SchemaOptions<Date> = {}>(
        options?: O & SchemaOptions<Date>,
    ): DateSchema<SchemaOptionsSimlify<O>>;
};

export const date = defineSchema<DateSchemaBase>({
    proto: () => proto,
});
