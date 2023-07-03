import { Maybe, Primitive } from '@nzyme/types';
import { Nullable, nullable } from '@nzyme/utils';

import { createError, CommonErrors, ValidationContext } from '@nzyme/validation';

import { NullableSchema, NullableSchemaConfig } from './NullableSchema.js';
import { SchemaDefaults, SchemaDeserializeOptions, SchemaSerializeOptions } from './Schema.js';
import { toGetter } from './SchemaUtils.js';
import { ScalarType } from './types.js';

export interface SchemaPrimitiveConfig<T, TNullable extends boolean>
    extends NullableSchemaConfig<T, TNullable>,
        SchemaDefaults<Nullable<T, TNullable>> {}

export abstract class SchemaPrimitive<
    T extends Primitive,
    TNullable extends boolean,
> extends NullableSchema<T, TNullable> {
    constructor(config: SchemaPrimitiveConfig<T, TNullable>, private readonly defaultVal: T) {
        super(config);

        if (config.default) {
            this.defaultValue = toGetter(config.default);
        }
    }

    public abstract type: ScalarType<T>;

    public defaultValue(): Nullable<T, TNullable> {
        if (this.nullable) {
            return nullable();
        }

        return this.defaultVal;
    }

    protected isNonNull(value: unknown): value is T {
        return this.type === typeof value;
    }

    protected coerceNonNull(value: T): Maybe<T> {
        return value;
    }

    public override preValidate(value: unknown, ctx: ValidationContext) {
        if (!this.is(value)) {
            return createError({
                code: CommonErrors.WrongType,
            });
        }

        return super.preValidate(value, ctx);
    }

    public serialize(value: Nullable<T, TNullable>, opts?: SchemaSerializeOptions<false>): unknown;
    public serialize(value: Nullable<T, TNullable>, opts?: SchemaSerializeOptions<true>): unknown;
    public serialize(
        value: Nullable<T, TNullable>,
        opts?: SchemaSerializeOptions<boolean>,
    ): unknown;
    public serialize(value: unknown): unknown {
        return this.normalize(value);
    }

    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<false>,
    ): Nullable<T, TNullable>;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<true>,
    ): Nullable<T, TNullable>;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<boolean>,
    ): Nullable<T, TNullable>;
    public deserialize(value: unknown): Nullable<T, TNullable> {
        return this.normalize(value);
    }

    public abstract normalize(value: unknown): Nullable<T, TNullable>;
}
