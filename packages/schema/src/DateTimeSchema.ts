import { GraphQLDateTime } from 'graphql-scalars';

import { Nullable } from '@nzyme/utils';
import { createError, CommonErrors, ValidationContext } from '@nzyme/validation';

import { NullableSchema } from './NullableSchema.js';
import { SchemaOptions, SchemaDefaults } from './Schema.js';
import { SchemaComparable } from './SchemaComparable.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { toGetter } from './SchemaUtils.js';
import { GRAPHQL } from './env.js';

export interface DateTimeSchemaConfig extends SchemaOptions<Date>, SchemaDefaults<Date> {}

export class DateTimeSchema<TNullable extends boolean = false>
    extends NullableSchema<Date, TNullable>
    implements SchemaComparable<Nullable<Date, TNullable>, number>
{
    public static readonly descriptor = new GenericDescriptor({
        type: 'DateTime',
        name: 'Date and time',
        graphqlType: GRAPHQL ? GraphQLDateTime : undefined,
    });

    constructor(config: DateTimeSchemaConfig = {}) {
        super(config);
        this.defaultValue = toGetter(config.default || new Date());
    }

    public get descriptor() {
        return DateTimeSchema.descriptor;
    }

    public readonly sortType = 'number';
    public readonly defaultValue: () => Date;

    protected isNonNull(value: unknown): value is Date {
        return value instanceof Date;
    }

    protected coerceNonNull(value: Date): Date {
        return value;
    }

    public sortValue(value: Nullable<Date, TNullable>): number {
        return value?.valueOf() ?? 0;
    }

    public override preValidate(value: unknown, ctx: ValidationContext) {
        if (!this.is(value)) {
            return createError({
                code: CommonErrors.WrongType,
            });
        }

        if (value && isNaN(value.valueOf())) {
            return createError({
                code: CommonErrors.InvalidValue,
            });
        }

        return super.preValidate(value, ctx);
    }

    public override serialize(value: Nullable<Date, TNullable>) {
        return value?.toISOString() ?? null;
    }

    public override deserialize(value: unknown) {
        if (value === null) {
            return this.defaultValueOrNull();
        }

        if (value === undefined) {
            return this.defaultValue();
        }

        if (typeof value === 'number') {
            return new Date(value);
        }

        return new Date(String(value));
    }

    public stringify(value: Nullable<Date, TNullable>): string {
        return value?.toLocaleString() ?? '';
    }
}
