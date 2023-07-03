import { GraphQLJSONObject } from 'graphql-scalars';

import { Maybe } from '@nzyme/types';
import { nullable, Nullable } from '@nzyme/utils';
import { createError, CommonErrors, ValidationContext } from '@nzyme/validation';

import { NullableSchema, NullableSchemaConfig } from './NullableSchema.js';
import { SchemaDefaults } from './Schema.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { toGetter } from './SchemaUtils.js';
import { GRAPHQL } from './env.js';

export interface JsonObjectSchemaConfig<T extends object, TNullable extends boolean>
    extends NullableSchemaConfig<T, TNullable>,
        SchemaDefaults<Nullable<T, TNullable>> {}

export class JsonObjectSchema<
    T extends object = object,
    TNullable extends boolean = false,
> extends NullableSchema<T, TNullable> {
    public static readonly descriptor = new GenericDescriptor({
        type: 'JSONObject',
        name: 'JSON object type',
        graphqlType: GRAPHQL ? GraphQLJSONObject : undefined,
    });

    constructor(config: JsonObjectSchemaConfig<T, TNullable> = {}) {
        super(config);

        if (config.default) {
            this.defaultValue = toGetter(config.default);
        }
    }

    public get descriptor() {
        return JsonObjectSchema.descriptor;
    }

    protected isNonNull(value: unknown): value is T {
        return typeof value === 'object' && !Array.isArray(value);
    }

    protected coerceNonNull(value: Partial<T>): Maybe<T> {
        return value as T;
    }

    public defaultValue(): Nullable<T, TNullable> {
        if (this.nullable) {
            return nullable();
        }

        return {} as T;
    }

    public override preValidate(value: unknown, ctx: ValidationContext) {
        if (!this.is(value)) {
            return createError({
                code: CommonErrors.WrongType,
            });
        }

        return super.preValidate(value, ctx);
    }

    public override serialize(value: T) {
        return value;
    }

    public override deserialize(value: unknown) {
        if (value == null) {
            return null;
        }

        if (typeof value === 'string') {
            return JSON.parse(value);
        }

        return value;
    }

    public stringify(value: Nullable<T, TNullable>): string {
        return JSON.stringify(value);
    }
}
