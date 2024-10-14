import { coerce } from './coerce.js';
import type { SchemaAny, SchemaValue } from '../Schema.js';

export function parseJson<S extends SchemaAny>(schema: S, json: string): SchemaValue<S> {
    try {
        const value: unknown = JSON.parse(json);
        return coerce(schema, value);
    } catch (e) {
        return coerce(schema, undefined);
    }
}
