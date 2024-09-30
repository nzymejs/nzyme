import type { IfUnknown, Primitive } from '@nzyme/types';

export type SchemaDefault<T> = T extends Primitive ? T | (() => T) : () => T;

export type SchemaOptions<V = unknown, TNullable extends boolean = boolean> = {
    nullable?: TNullable;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default?: IfUnknown<V, SchemaDefault<any>, SchemaDefault<V>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaOptionsNullable<O extends SchemaOptions<any>> = IfUnknown<
    O['nullable'],
    false,
    O['nullable']
>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Schema<
    V = unknown,
    O extends SchemaOptions<V, boolean> = { nullable: boolean },
    T extends string = string,
> = {
    type: T;
    nullable: SchemaOptionsNullable<O>;
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
    default: (() => V) | null;
} & Omit<O, 'default' | 'nullable'>;

export type SchemaValue<TSchema extends Schema> = ReturnType<TSchema['coerce']>;
