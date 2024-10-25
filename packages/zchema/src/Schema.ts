import type { IfAny, IfUnknown, Simplify } from '@nzyme/types';
import type { Validator } from '@nzyme/validate';

export interface SchemaOptions<V> {
    nullable?: boolean;
    optional?: boolean;
    default?: () => V;
    validators?: Validator<V>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaOptionsSimlify<O extends SchemaOptions<any>> = Simplify<{
    [K in Exclude<keyof O, 'validators' | 'default'>]: O[K];
}>;

export interface SchemaProto<V = unknown> {
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
    check: (value: unknown) => value is V;
    default: () => V;
    visit?: (value: V, visitor: SchemaVisitor) => void;
}

export interface SchemaVisitor {
    (schema: Schema, value: unknown, key: string | number): unknown;
}

export const SCHEMA_PROTO = Symbol('SchemaProto');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaOptionsOf<S extends SchemaAny> = S extends Schema<any, infer O> ? O : never;

export interface SchemaBase<
    V = unknown,
    O extends SchemaOptions<V> = { nullable?: boolean; optional?: boolean },
> {
    [SCHEMA_PROTO]: SchemaProto<V>;
    nullable: IfAny<O, boolean, IfUnknown<O['nullable'], false, Exclude<O['nullable'], undefined>>>;
    optional: IfAny<O, boolean, IfUnknown<O['optional'], false, Exclude<O['optional'], undefined>>>;
    default?: () => V;
    validators: Validator[];
}

export type Schema<
    V = unknown,
    O extends SchemaOptions<V> = { nullable?: boolean; optional?: boolean },
> = SchemaBase<V, O> & {
    [K in Exclude<keyof O, keyof SchemaOptions<V>>]: O[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaAny = Schema<any, any>;

export type SchemaValue<TSchema extends SchemaAny> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSchema extends Schema<infer V, any>
        ? V | NullableValue<TSchema['nullable']> | OptionalValue<TSchema['optional']>
        : never;

type NullableValue<N extends boolean> = N extends false ? never : null;
type OptionalValue<N extends boolean> = N extends false ? never : undefined;
