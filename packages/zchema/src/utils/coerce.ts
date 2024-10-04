import { SCHEMA_PROTO, type SchemaAny, type SchemaProto, type SchemaValue } from '../Schema.js';

export function coerce<S extends SchemaAny>(schema: S, value: unknown): SchemaValue<S> {
    const proto = schema[SCHEMA_PROTO] as SchemaProto<SchemaValue<S>>;

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

    return proto.coerce(value);
}
