import type { SchemaAny, SchemaValue } from './Schema.js';
import { SCHEMA_PROTO } from './SchemaDefinition.js';

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
