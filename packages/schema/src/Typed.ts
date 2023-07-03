import { Flatten, Merge } from '@nzyme/types';

export type TypeName = '__typename';

export interface Typed<TType extends string = string> {
    __typename: TType;
}

export interface TypedAny<TType extends string = string> extends Typed<TType> {
    [key: string]: unknown;
}

export type WithType<T extends object, TType extends string = string> = Merge<T, Typed<TType>>;

export type WithoutType<T> = Flatten<{
    [K in Exclude<keyof T, TypeName>]: T[K];
}>;

export type PartialTyped<T extends Typed> = Flatten<{
    [K in keyof T]: K extends TypeName ? ValueOf<T> : T[K];
}>;

export type ValueOf<T extends Typed> = T['__typename'];
