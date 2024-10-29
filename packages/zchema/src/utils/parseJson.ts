import { coerce } from './coerce.js';
import type { Schema, SchemaValue } from '../Schema.js';

export function parseJson<S extends Schema>(schema: S, json: string): SchemaValue<S> {
    try {
        const value: unknown = JSON.parse(json);
        return coerce(schema, value);
    } catch {
        return coerce(schema);
    }
}
