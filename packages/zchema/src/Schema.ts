import type { IfAny, IfUnknown, Simplify } from '@nzyme/types';

import type {
    SCHEMA_DEFINITION,
    SCHEMA_PROTO,
    SchemaDefinition,
    SchemaProto,
} from './SchemaDefinition.js';

export type SchemaOptions<V = unknown> = {
    nullable?: boolean;
    default?: () => V;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type Schema<V = unknown, O extends SchemaOptions<V> = { nullable?: boolean }> = {
    [SCHEMA_DEFINITION]: SchemaDefinition<V>;
    [SCHEMA_PROTO]: SchemaProto<V>;
    nullable: IfAny<O, boolean, IfUnknown<O['nullable'], false, Exclude<O['nullable'], undefined>>>;
} & {
    [K in Exclude<keyof O, 'nullable'>]: O[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaAny = Schema<any, any>;

export type SchemaValue<TSchema extends SchemaAny> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSchema extends Schema<infer V, any>
        ? TSchema['nullable'] extends false
            ? IfAny<V, unknown, Simplify<V>>
            : IfAny<V, unknown, V> | null
        : never;
