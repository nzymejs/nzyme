import type { Schema, SchemaOptions } from './Schema.js';

export type SchemaProto<V = unknown> = {
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaFactory<V = any, O extends SchemaOptions<V> = any> = (options: O) => Schema<V, O>;

export const SCHEMA_PROTO = Symbol('SchemaProto');

/*#__NO_SIDE_EFFECTS__*/
export function defineSchema<F extends SchemaFactory>(factory: F): F {
    return factory;
}
