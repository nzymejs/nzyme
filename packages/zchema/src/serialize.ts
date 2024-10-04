import { SCHEMA_PROTO, type SchemaAny, type SchemaValue } from './Schema.js';

export function serialize<S extends SchemaAny>(schema: S, value: SchemaValue<S>): unknown {
    const def = schema[SCHEMA_PROTO];

    if (value === null && schema.nullable) {
        return null;
    }

    if (value === undefined && schema.optional) {
        return undefined;
    }

    return def.serialize(value);
}
