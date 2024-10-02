import type { SchemaOptions, Schema } from './Schema.js';
import { SCHEMA_DEFINITION, SCHEMA_PROTO, type SchemaProto } from './SchemaDefinition.js';

export type CreateSchemaParams<V, T extends string, O extends SchemaOptions<V>> = {
    type: T;
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
    options: (O & SchemaOptions<V>) | undefined;
};

export function createSchema<V, O extends SchemaOptions<V>>(
    proto: SchemaProto<V>,
    options: O = {} as O,
) {
    const definition = proto(options);
    const schema: Schema<V, O> = {
        ...options,
        nullable: (options.nullable ?? false) as Schema<V, O>['nullable'],
        optional: (options.optional ?? false) as Schema<V, O>['optional'],
        [SCHEMA_PROTO]: proto,
        [SCHEMA_DEFINITION]: definition,
    };

    return schema;
}
