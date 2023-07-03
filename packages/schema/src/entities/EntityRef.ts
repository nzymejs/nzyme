import { GraphQLType } from 'graphql';

import { Maybe, Simplify } from '@nzyme/types';
import { Nullable, nullable } from '@nzyme/utils';
import { CommonErrors, singleError, ValidationContext, ValidationErrors } from '@nzyme/validation';

import { NullableSchema, NullableSchemaConfig } from '../NullableSchema.js';
import { SchemaDeserializeOptions, SchemaSerializeOptions, SchemaQuery } from '../Schema.js';
import { GenericDescriptor } from '../SchemaDescriptor.js';
import { Typed } from '../Typed.js';
import { GRAPHQL } from '../env.js';

import { EntityDefinition, EntityDefinitionAny } from './EntitySchema.js';
import { isEntity } from './EntityUtils.js';

export interface EntityRefConfig<TEntity extends EntityDefinitionAny, TNullable extends boolean>
    extends NullableSchemaConfig<EntityRefOf<TEntity>, TNullable> {
    entity: TEntity | (() => TEntity);
}

export interface EntityRef<TType extends string = string> extends Typed<TType> {
    id: string;
}

export type EntityRefOf<TSchema extends EntityDefinitionAny> = Simplify<
    EntityRef<TSchema['typename']>
>;

type NullableRef<TSchema extends EntityDefinitionAny, TNullable extends boolean> = Nullable<
    EntityRefOf<TSchema>,
    TNullable
>;

export class EntityRefSchema<
    TEntity extends EntityDefinitionAny = EntityDefinition,
    TNullable extends boolean = boolean,
> extends NullableSchema<EntityRefOf<TEntity>, TNullable, SchemaQuery<TEntity> | null> {
    public static readonly descriptor = new GenericDescriptor({
        type: 'EntityRef',
        name: 'Entity reference',
        graphqlType: undefined,
    });

    private entityGet: () => TEntity;

    constructor(config: EntityRefConfig<TEntity, TNullable>) {
        super(config);

        const entity = config.entity;
        if (isEntity(entity)) {
            this.entityGet = () => entity as TEntity;
        } else {
            this.entityGet = () => {
                const e = (entity as () => TEntity)();
                this.entityGet = () => e;
                return e;
            };
        }
    }

    public get entity() {
        return this.entityGet();
    }

    public get descriptor() {
        return EntityRefSchema.descriptor;
    }

    public override get typename(): TEntity['typename'] {
        return this.entity.typename;
    }

    public defaultValue(): NullableRef<TEntity, TNullable> {
        if (this.nullable) {
            return nullable();
        }

        return {
            __typename: this.entity.typename,
            id: '',
        };
    }

    protected isNonNull(value: unknown): value is EntityRefOf<TEntity> {
        return this.entity.is(value);
    }

    protected coerceNonNull(value: Partial<EntityRefOf<TEntity>>): Maybe<EntityRefOf<TEntity>> {
        return {
            ...value,
            __typename: value.__typename || this.entity.typename,
            id: value.id || '',
        };
    }

    public override validate(value: unknown, ctx: ValidationContext): ValidationErrors | null {
        if (!value) {
            return null;
        }

        const errors = super.validate(value, ctx);
        if (errors) {
            return errors;
        }

        if (!this.is(value)) {
            return singleError({
                code: CommonErrors.WrongType,
            });
        }

        if (!value.id) {
            return singleError({
                code: CommonErrors.NonExisting,
            });
        }

        return null;
    }

    public serialize(
        value: NullableRef<TEntity, TNullable>,
        opts?: SchemaSerializeOptions<false>,
    ): unknown;
    public serialize(
        value: SchemaQuery<TEntity> | null,
        opts?: SchemaSerializeOptions<true>,
    ): unknown;
    public serialize(
        value: NullableRef<TEntity, TNullable> | SchemaQuery<TEntity> | null,
        opts?: SchemaSerializeOptions,
    ): unknown;
    public serialize(
        value: NullableRef<TEntity, TNullable> | SchemaQuery<TEntity> | null,
        opts?: SchemaSerializeOptions,
    ): unknown {
        if (!value) {
            return this.defaultValueOrNull();
        }

        if (opts?.graphql) {
            return this.entity.descriptor.serialize(
                value as SchemaQuery<TEntity>,
                opts as SchemaSerializeOptions<true>,
            );
        }

        return {
            __typename: value.__typename,
            id: value.id,
        };
    }

    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<false>,
    ): NullableRef<TEntity, TNullable>;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<true>,
    ): SchemaQuery<TEntity> | null;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<boolean>,
    ): NullableRef<TEntity, TNullable> | SchemaQuery<TEntity> | null;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions,
    ): NullableRef<TEntity, TNullable> | SchemaQuery<TEntity> | null {
        if (value === null) {
            return this.defaultValueOrNull();
        }

        if (!value || typeof value !== 'object') {
            return this.defaultValue();
        }

        const ref = value as EntityRefOf<TEntity>;

        if (opts?.graphql) {
            return this.entity.descriptor.deserialize(
                value,
                opts as SchemaDeserializeOptions<true>,
            ) as SchemaQuery<TEntity>;
        }

        return {
            __typename: ref.__typename || this.entity.typename,
            id: ref.id || '',
        };
    }

    // TODO write a proper stringify
    public stringify(value: NullableRef<TEntity, TNullable> | null): string {
        if (!value) {
            return '';
        }

        return value.toLocaleString();
    }

    protected override getGraphqlTypeNullable(): GraphQLType | undefined {
        if (!GRAPHQL) {
            return undefined;
        }

        return this.entity.descriptor.graphqlType;
    }
}
