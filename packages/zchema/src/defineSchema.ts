import type { SchemaOptions } from './Schema.js';
import type { SchemaDefinition, SchemaProto } from './SchemaDefinition.js';

export function defineSchema<V, O extends SchemaOptions<V>>(
    proto: SchemaProto<V, O>,
): SchemaProto<V>;
export function defineSchema<V>(definition: SchemaDefinition<V>): SchemaProto<V>;
export function defineSchema<V>(protoOrDef: SchemaProto<V> | SchemaDefinition<V>): SchemaProto<V> {
    if (typeof protoOrDef === 'function') {
        return protoOrDef;
    }

    return () => protoOrDef;
}
