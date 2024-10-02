import type { IfAny, IfUnknown } from '@nzyme/types';

import type {
    SCHEMA_DEFINITION,
    SCHEMA_PROTO,
    SchemaDefinition,
    SchemaProto,
} from './SchemaDefinition.js';

export type SchemaOptions<V = unknown> = {
    nullable?: boolean;
    optional?: boolean;
    default?: () => V;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type Schema<
    V = unknown,
    O extends SchemaOptions<V> = { nullable?: boolean; optional?: boolean },
> = {
    [SCHEMA_DEFINITION]: SchemaDefinition<V>;
    [SCHEMA_PROTO]: SchemaProto<V>;
    nullable: IfAny<O, boolean, IfUnknown<O['nullable'], false, Exclude<O['nullable'], undefined>>>;
    optional: IfAny<O, boolean, IfUnknown<O['optional'], false, Exclude<O['optional'], undefined>>>;
    default?: () => V;
} & {
    [K in Exclude<keyof O, 'nullable' | 'optional'>]: O[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaAny = Schema<any, any>;

export type SchemaValue<TSchema extends SchemaAny> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSchema extends Schema<infer V, any>
        ?
              | IfAny<V, unknown, V>
              | NullableValue<TSchema['nullable']>
              | OptionalValue<TSchema['optional']>
        : never;

type NullableValue<N extends boolean> = N extends false ? never : null;
type OptionalValue<N extends boolean> = N extends false ? never : undefined;
