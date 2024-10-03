import type { SchemaOptions, Schema } from './Schema.js';
import { SCHEMA_PROTO, type SchemaProto } from './SchemaDefinition.js';

export function createSchema<V, O extends SchemaOptions<V> = SchemaOptions<V>>(
    proto: SchemaProto<V>,
    options: O & SchemaOptions<V> = {} as O,
) {
    type S = Schema<V, O>;
    const schema: S = {
        ...options,
        nullable: (options.nullable ?? false) as S['nullable'],
        optional: (options.optional ?? false) as S['optional'],
        validators: options.validators ?? [],
        [SCHEMA_PROTO]: proto,
    };

    return schema;
}
