import type { SchemaAny, SchemaValue } from './Schema.js';
import { SCHEMA_DEFINITION } from './SchemaDefinition.js';

export function coerce<S extends SchemaAny>(schema: S, value: unknown): SchemaValue<S> {
    const def = schema[SCHEMA_DEFINITION];

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
    }

    return def.coerce(value) as SchemaValue<S>;
}
