import type { IfAny, IfUnknown, Simplify } from '@nzyme/types';
import type { Validator } from '@nzyme/validate';

import type { SchemaFactory, SchemaProto } from './SchemaDefinition.js';

export type SchemaOptions<V> = {
    nullable?: boolean;
    optional?: boolean;
    default?: () => V;
    validators?: Validator<V>[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaOptionsSimlify<O extends SchemaOptions<any>> = Simplify<{
    [K in Exclude<keyof O, 'validators' | 'default'>]: O[K];
}>;

export const SCHEMA_PROTO = Symbol('SchemaProto');
export const SCHEMA_FACTORY = Symbol('SchemaFactory');
export const SCHEMA_OPTIONS = Symbol('SchemaOptions');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaOptionsOf<S extends SchemaAny> = S extends Schema<any, infer O> ? O : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Schema<
    V = unknown,
    O extends SchemaOptions<V> = { nullable?: boolean; optional?: boolean },
> = {
    [SCHEMA_PROTO]: SchemaProto<V>;
    [SCHEMA_FACTORY]: SchemaFactory<V>;
    [SCHEMA_OPTIONS]: O;
    nullable: IfAny<O, boolean, IfUnknown<O['nullable'], false, Exclude<O['nullable'], undefined>>>;
    optional: IfAny<O, boolean, IfUnknown<O['optional'], false, Exclude<O['optional'], undefined>>>;
    default?: () => V;
    validators: Validator<V>[];
} & {
    [K in Exclude<keyof O, 'nullable' | 'optional' | 'validators' | 'default'>]: O[K];
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
