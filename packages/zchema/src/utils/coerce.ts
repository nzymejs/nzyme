import type { Schema, SchemaProto, SchemaValue, SchemaValueNonNull } from '../Schema.js';

export function coerce<S extends Schema>(schema: S, value: Partial<SchemaValue<S>>): SchemaValue<S>;
export function coerce<S extends Schema>(schema: S, value?: unknown): SchemaValue<S>;
export function coerce<S extends Schema>(schema: S, value?: unknown): SchemaValue<S> {
    const proto = schema.proto as SchemaProto<SchemaValueNonNull<S>>;

    if (value === null) {
        if (schema.nullable) {
            return null as SchemaValue<S>;
        }

        if (schema.default) {
            return schema.default() as SchemaValue<S>;
        }

        if (schema.optional) {
            return undefined as SchemaValue<S>;
        }

        return proto.default();
    }

    if (value === undefined) {
        if (schema.optional) {
            return undefined as SchemaValue<S>;
        }

        if (schema.default) {
            return schema.default() as SchemaValue<S>;
        }

        if (schema.nullable) {
            return null as SchemaValue<S>;
        }

        return proto.default();
    }

    const result = proto.coerce(value);
    if (result === undefined) {
        throw new Error('Invalid value');
    }

    return result;
}
