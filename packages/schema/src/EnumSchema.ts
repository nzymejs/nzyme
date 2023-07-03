import { GraphQLEnumType, GraphQLEnumValueConfigMap, GraphQLType } from 'graphql';

import { Translatable, translate } from '@nzyme/i18n';
import { Maybe } from '@nzyme/types';
import { Nullable } from '@nzyme/utils';
import { createError, CommonErrors, ValidationContext } from '@nzyme/validation';

import { NullableSchema, NullableSchemaConfig } from './NullableSchema.js';
import { SchemaDefaults } from './Schema.js';
import { SchemaComparable } from './SchemaComparable.js';
import { SchemaDescriptor, SchemaDescriptorConfig } from './SchemaDescriptor.js';
import { SchemaError } from './SchemaError.js';
import { toGetter } from './SchemaUtils.js';
import { GRAPHQL } from './env.js';

export interface EnumSchemaValueConfig {
    name?: string | Translatable;
}

export interface EnumSchemaValue<T extends string = string> {
    name: Translatable;
    value: T;
    /** Numeric value of the enum. */
    valueNumeric: number;
}

export interface EnumSchemaDefinition<T extends Record<string, EnumSchemaValueConfig>>
    extends SchemaDescriptorConfig {
    readonly values: T;
    readonly default?: keyof T & string;
}

interface EnumDescriptorConfig<T extends string> extends SchemaDescriptorConfig {
    values: Record<T, EnumSchemaValue<T>>;
}

export class EnumDescriptor<T extends string> extends SchemaDescriptor {
    public readonly graphqlType: GraphQLType | undefined;
    public readonly values: Record<T, EnumSchemaValue<T>>;

    constructor(config: EnumDescriptorConfig<T>) {
        super(config);
        this.values = config.values;

        if (GRAPHQL) {
            const enumValues: GraphQLEnumValueConfigMap = {};

            for (const value in this.values) {
                enumValues[String(value)] = {
                    value: value,
                    description: translate(this.values[value].name),
                };
            }

            this.graphqlType = new GraphQLEnumType({
                name: config.type,
                description: translate(this.name),
                values: enumValues,
            });
        }
    }
}

export interface EnumSchemaConfig<T extends string, TNullable extends boolean>
    extends NullableSchemaConfig<T, TNullable>,
        SchemaDefaults<Nullable<T, TNullable>> {}

export interface EnumSchemaConstructor<T extends string> {
    new <TNullable extends boolean = false>(config?: EnumSchemaConfig<T, TNullable>): EnumSchema<
        T,
        TNullable
    >;

    readonly type: string;
    readonly values: { readonly [K in T]: EnumSchemaValue<T> };
    readonly valuesArray: readonly EnumSchemaValue<T>[];
    readonly enums: readonly T[];
}

export abstract class EnumSchema<T extends string = string, TNullable extends boolean = boolean>
    extends NullableSchema<T, TNullable>
    implements SchemaComparable<Nullable<T, TNullable>, number>
{
    public abstract readonly values: { readonly [K in T]: EnumSchemaValue<T> };
    public abstract readonly valuesArray: readonly EnumSchemaValue<T>[];
    public abstract readonly enums: readonly T[];
    public readonly sortType = 'number';

    public sortValue(value: Nullable<T, TNullable>): number {
        if (value == null) {
            return -1;
        }

        return this.values[value as T]?.valueNumeric ?? -1;
    }

    protected isNonNull(value: unknown): value is T {
        if (value === undefined) {
            return false;
        }

        return !!this.values[value as T];
    }

    protected coerceNonNull(value: Partial<T>): Maybe<T> {
        return value as Maybe<T>;
    }

    public override preValidate(value: unknown, ctx: ValidationContext) {
        if (!this.is(value)) {
            return createError({
                code: CommonErrors.InvalidValue,
            });
        }

        return super.preValidate(value, ctx);
    }

    public serialize(value: Nullable<T, TNullable>): Nullable<T, TNullable> {
        return value;
    }

    public deserialize(value: unknown): Nullable<T, TNullable> {
        if (value === null) {
            return this.defaultValueOrNull();
        }

        if (value === undefined) {
            return this.defaultValue();
        }

        if (typeof value === 'string' && this.values[value as T]) {
            return value as T;
        }

        if (typeof value === 'number') {
            const found = this.valuesArray.find(x => x.valueNumeric === value)?.value;
            if (found) {
                return found;
            }
        }

        return this.defaultValue();
    }

    public stringify(value: T): Translatable {
        return this.values[value].name;
    }
}

export namespace EnumSchema {
    export function define<T extends Record<string, EnumSchemaValueConfig>>(
        def: EnumSchemaDefinition<T>,
    ) {
        type V = keyof T & string;

        const enums: V[] = [];
        const valuesArray: EnumSchemaValue<V>[] = [];
        const values = {} as Record<V, EnumSchemaValue<V>>;

        let index = 0;
        for (const key in def.values) {
            const value = def.values[key];
            const enumValue: EnumSchemaValue<V> = {
                value: key,
                valueNumeric: index,
                name: value.name ?? key,
            };

            enums.push(key);
            values[key] = enumValue;
            valuesArray.push(enumValue);

            index++;
        }

        if (!valuesArray.length) {
            throw new SchemaError(`Enum "${def.type}" is not defining any values.`);
        }

        const descriptor = new EnumDescriptor({
            type: def.type,
            name: def.name,
            values: values,
        });

        const cls = class extends EnumSchema<keyof T & string, boolean> {
            public readonly descriptor = descriptor;
            public static readonly type = def.type;
            public readonly values = values;
            public static readonly values = values;
            public readonly valuesArray: readonly EnumSchemaValue<V>[] = valuesArray;
            public static readonly valuesArray: readonly EnumSchemaValue<V>[] = valuesArray;
            public readonly enums = enums;
            public static readonly enums = enums;

            public readonly defaultValue: () => Nullable<V, boolean>;

            constructor(config: EnumSchemaConfig<V, boolean> = {}) {
                super({
                    name: config.name || def.name || def.type,
                    validate: config.validate,
                    nullable: config.nullable,
                });

                this.defaultValue = toGetter(config.default || def.default || enums[0]);
            }
        };

        return cls as EnumSchemaConstructor<keyof T & string>;
    }
}
