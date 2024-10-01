import type { SchemaOptions } from './Schema.js';

export type SchemaDefinition<V = unknown> = {
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
};

export type SchemaProto<V = unknown, O extends SchemaOptions<V> = SchemaOptions<V>> = (
    options: O,
) => SchemaDefinition<V>;

export const SCHEMA_DEFINITION = Symbol('SchemaDefinition');
export const SCHEMA_PROTO = Symbol('SchemaProto');
