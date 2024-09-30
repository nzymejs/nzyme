import type { Schema } from './Schema.js';

export function parse<T>(schema: Schema<T>, value: unknown): T {
    if (value != null) {
        return schema.coerce(value);
    }

    if (schema.nullable) {
        return null as T;
    }

    if (schema.default) {
        return schema.default();
    }
}
