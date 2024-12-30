import type { SchemaAny, SchemaValue } from '../Schema.js';

export function serialize<S extends SchemaAny>(schema: S, value: SchemaValue<S>): unknown {
    const proto = schema.proto;

    if (value === null && schema.nullable) {
        return null;
    }

    if (value === undefined && schema.optional) {
        return undefined;
    }

    return proto.serialize(value);
}
