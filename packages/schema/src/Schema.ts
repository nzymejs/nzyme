import { GraphQLNonNull, GraphQLType } from 'graphql';

import { Translatable } from '@nzyme/i18n';
import { AbstractConstructor, IfAny, Immutable, Maybe, Strict } from '@nzyme/types';
import { arrayReverse } from '@nzyme/utils';
import { Validable, ValidableConfig } from '@nzyme/validation';

import { SchemaDescriptor } from './SchemaDescriptor.js';
import { GRAPHQL } from './env.js';

export interface SchemaOptions<T> extends ValidableConfig<Strict<T>> {
    name?: string | Translatable;
}

export interface SchemaConfig<TQuery = unknown> {
    query: TQuery;
    role: SchemaRole;
}

export interface SchemaDefaults<T> {
    default?: T | (() => T);
}

export type SchemaRole = 'prop' | 'getter';

export interface SchemaSerializeOptions<TGraphql extends boolean = boolean> {
    /** Will serialize as a GraphQL result. */
    readonly graphql?: TGraphql;
}

export interface SchemaDeserializeOptions<TGraphql extends boolean = boolean> {
    /** Will deserialize as GraphQL result. */
    readonly graphql?: TGraphql;
}

export type SchemaAny = Schema<any>;

declare const valueSymbol: unique symbol;
declare const querySymbol: unique symbol;

export abstract class Schema<T = unknown, TQuery = T> extends Validable<Strict<T>> {
    public readonly symbol = Symbol('schema');
    public readonly name: Translatable;

    /**
     * @ignore
     * Used only for type inference - do not use.
     */
    public readonly [valueSymbol]!: T;
    /**
     * @ignore
     * Used only for type inference - do not use.
     **/
    public readonly [querySymbol]!: TQuery;

    constructor(config: SchemaOptions<T>) {
        super(config);
        this.name = config.name || '';
    }

    public abstract readonly descriptor: SchemaDescriptor;

    public get typename() {
        return this.descriptor.typename;
    }

    public get graphqlType(): GraphQLType | undefined {
        if (!GRAPHQL) {
            return undefined;
        }

        const innerType = this.descriptor.graphqlType;
        return innerType && new GraphQLNonNull(innerType);
    }

    public abstract defaultValue(): T;
    public abstract is(obj: unknown): obj is T;

    public abstract coerce(value: IfAny<T, any, Partial<T>> | null | undefined): T;

    public abstract serialize(value: T, opts?: SchemaSerializeOptions<false>): unknown;
    public abstract serialize(value: TQuery, opts?: SchemaSerializeOptions<true>): unknown;
    public abstract serialize(value: T | TQuery, opts?: SchemaSerializeOptions): unknown;

    public abstract deserialize(value: unknown, opts?: SchemaDeserializeOptions<false>): T;
    public abstract deserialize(value: unknown, opts?: SchemaDeserializeOptions<true>): TQuery;
    public abstract deserialize(value: unknown, opts?: SchemaDeserializeOptions): T | TQuery;

    public abstract stringify(value: T): Translatable;

    public visit(value: Maybe<T>, visitor: SchemaVisitor): SchemaVisitorResult {
        return visitor(value, this as Schema<unknown>);
    }

    public filter(collection: Immutable<unknown[]>) {
        return collection.filter(x => this.is(x)) as T[];
    }

    public find(collection: Immutable<unknown[]>) {
        return collection.find(x => this.is(x)) as T | undefined;
    }

    public findLast(collection: Immutable<unknown[]>) {
        for (const item of arrayReverse(collection)) {
            if (this.is(item)) {
                return item;
            }
        }
    }

    public findIndex(collection: Immutable<unknown[]>) {
        return collection.findIndex(x => this.is(x));
    }
}

export type SchemaVisitorResult = void | undefined | true;

export interface SchemaVisitor {
    (value: unknown, schema: Schema<unknown>): SchemaVisitorResult;
}

export type SchemaValue<T> = T extends SchemaAny
    ? T[typeof valueSymbol]
    : T extends new () => infer S
    ? S extends SchemaAny
        ? Exclude<S[typeof valueSymbol], null>
        : never
    : never;

export type SchemaQuery<T> = T extends SchemaAny
    ? T[typeof querySymbol]
    : T extends new () => infer S
    ? S extends SchemaAny
        ? S[typeof querySymbol]
        : never
    : never;

export interface SchemaConstructor<T extends SchemaAny> extends AbstractConstructor<T> {
    descriptor: SchemaDescriptor;
}

export type SchemaConstructorAny = SchemaConstructor<SchemaAny>;
