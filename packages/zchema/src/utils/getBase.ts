import { type SchemaBase, SCHEMA_BASE, type Schema } from '../Schema.js';

export function getBase<V = unknown>(schema: Schema<V>): SchemaBase {
    return schema[SCHEMA_BASE];
}
