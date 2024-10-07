import { SCHEMA_PROTO, type Schema } from '../Schema.js';

export function isSchema<V = unknown>(value: unknown): value is Schema<V> {
    return value != null && typeof value === 'object' && SCHEMA_PROTO in value;
}
