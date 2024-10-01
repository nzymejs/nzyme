import type { SchemaAny, SchemaValue } from './Schema.js';
import { SCHEMA_DEFINITION } from './SchemaDefinition.js';

export function serialize<S extends SchemaAny>(schema: S, value: SchemaValue<S>): unknown {
    const def = schema[SCHEMA_DEFINITION];

    if (value == null && schema.nullable) {
        return null;
    }

    return def.serialize(value);
}
