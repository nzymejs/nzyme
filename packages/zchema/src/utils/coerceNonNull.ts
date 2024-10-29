import { SCHEMA_PROTO, type Schema, type SchemaProto, type SchemaValueNonNull } from '../Schema.js';

export function coerceNonNull<S extends Schema>(schema: S, value?: unknown): SchemaValueNonNull<S> {
    const proto = schema[SCHEMA_PROTO] as SchemaProto<SchemaValueNonNull<S>>;

    if (value === null) {
        if (schema.default) {
            return schema.default() as SchemaValueNonNull<S>;
        }

        return proto.default();
    }

    if (value === undefined) {
        if (schema.default) {
            return schema.default() as SchemaValueNonNull<S>;
        }

        return proto.default();
    }

    return proto.coerce(value);
}
