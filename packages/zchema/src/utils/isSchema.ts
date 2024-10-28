import { SCHEMA_BASE, SCHEMA_PROTO, type Schema, type SchemaBase } from '../Schema.js';

export function isSchema<V = unknown>(value: unknown): value is Schema<V>;
export function isSchema<F extends SchemaBase>(value: unknown, factory: F): value is ReturnType<F>;
export function isSchema(value: unknown, factory?: SchemaBase) {
    if (isSchemaBase(value)) {
        if (factory == null) {
            return true;
        }

        return value[SCHEMA_BASE] === factory;
    }

    return false;
}

function isSchemaBase(value: unknown): value is Schema {
    return value != null && typeof value === 'object' && SCHEMA_PROTO in value;
}
