import { GraphQLNonNull, GraphQLType } from 'graphql';

import { Maybe } from '@nzyme/types';
import { Nullable, nullable } from '@nzyme/utils';
import { requiredError, ValidationContext } from '@nzyme/validation';

import { Schema, SchemaOptions } from './Schema.js';
import { GRAPHQL } from './env.js';

export interface NullableSchemaConfig<TValue, TNullable extends boolean>
    extends SchemaOptions<Nullable<TValue, TNullable>> {
    nullable?: TNullable;
}

export abstract class NullableSchema<
    TValue,
    TNullable extends boolean = false,
    TQuery = Nullable<TValue, TNullable>,
> extends Schema<Nullable<TValue, TNullable>, TQuery> {
    public readonly nullable: TNullable;

    constructor(config: NullableSchemaConfig<TValue, TNullable>) {
        super(config);
        this.nullable = config.nullable || (false as TNullable);
    }

    public is(value: unknown): value is Nullable<TValue, TNullable> {
        if (value === null) {
            return this.nullable;
        }

        return this.isNonNull(value);
    }

    protected abstract isNonNull(value: unknown): value is TValue;

    public coerce(value: Maybe<Partial<TValue>>): Nullable<TValue, TNullable> {
        if (value == null) {
            return this.defaultValueOrNull();
        }

        return this.coerceNonNull(value) ?? this.defaultValue();
    }

    protected abstract coerceNonNull(value: Partial<TValue>): Maybe<TValue>;

    protected defaultValueOrNull(): Nullable<TValue, TNullable> {
        return this.nullable ? nullable() : this.defaultValue();
    }

    public override async validate(value: unknown, ctx: ValidationContext = {}) {
        if (value == null) {
            return this.nullable ? null : requiredError();
        }

        return await super.validate(value, ctx);
    }

    public override get graphqlType(): GraphQLType | undefined {
        if (!GRAPHQL) {
            return undefined;
        }

        const nullable = this.getGraphqlTypeNullable();
        if (!nullable) {
            return undefined;
        }

        if (this.nullable) {
            return nullable;
        }

        return new GraphQLNonNull(nullable);
    }

    protected getGraphqlTypeNullable() {
        if (!GRAPHQL) {
            return undefined;
        }

        return this.descriptor.graphqlType;
    }
}

export function isNullableSchema(schema: unknown): schema is NullableSchema<unknown, true> {
    return schema instanceof NullableSchema && schema.nullable;
}
