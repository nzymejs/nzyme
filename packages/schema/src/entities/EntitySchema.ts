import { Flatten, Simplify, SomeObject } from '@nzyme/types';
import { writable } from '@nzyme/utils';

import { ApiMethods, ApiMethodsAny } from '../ApiMethod.js';
import { NullableSchemaConfig } from '../NullableSchema.js';
import { ObjectKind } from '../object/ObjectConfig.js';
import { ObjectProps } from '../object/ObjectProps.js';
import {
    ObjectSchemaConstructor,
    ObjectSchema,
    ObjectSchemaStatic,
    ObjectSchemaOptions,
    ObjectValue,
    ObjectQuery,
    ObjectDescriptor,
} from '../object/ObjectSchema.js';
import {
    DefineAbstractObjectOptions,
    DefineObjectOptions,
    DefineOpenObjectOptions,
    DefineSealedObjectOptions,
    defineObjectConstructor,
    getObjectKind,
} from '../object/defineObject.js';

import { EntityMetaProps, EntityProps, EntityWithMeta } from './Entity.js';
import {
    createEntityApi,
    EntityApi,
    EntityApiBasic,
    EntityApiConfig,
    EntityApiConfigToMethods,
} from './EntityApi.js';
import { EntityConfig, EntityConfigDefault, EntitySchemaConfig } from './EntityConfig.js';
import { EntityDescriptor } from './EntityDescriptor.js';
import { EntityRefOf, EntityRefSchema } from './EntityRef.js';
import { EntitySortKey } from './EntitySortKeys.js';

export type EntityValue<T extends EntityConfig = EntityConfig> = ObjectValue<T>;
export type EntityValueWithMeta<T extends EntityConfig = EntityConfig> = ObjectValue<T> &
    EntityWithMeta;
export type EntityQuery<T extends EntityConfig = EntityConfig> = ObjectQuery<T> & EntityWithMeta;

export interface DefineEntityOptions<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TBase extends EntityConfig,
    TApiConfig extends EntityApiConfig,
    TApiCustom extends ApiMethodsAny,
    TKind extends ObjectKind,
> extends Omit<DefineObjectOptions<TProps, TType, TMeta, TBase>, 'base'> {
    readonly base?: EntityConstructor<TBase>;
    readonly sortKeys?: readonly EntitySortKey<
        EntityConfigFromParams<TProps, TType, TMeta, TBase, TKind>
    >[];
    readonly displayProps?: ReadonlyArray<keyof (TProps & TBase['props']) & string>;

    readonly api?: TApiConfig;
    readonly apiCustom?: (
        entity: EntityConstructor<EntityConfigFromParams<TProps, TType, TMeta, TBase, TKind>>,
    ) => TApiCustom;
}

export type EntitySchemaAny = EntitySchema<any>;

export abstract class EntitySchema<
    T extends EntitySchemaConfig = EntitySchemaConfig,
> extends ObjectSchema<T> {
    public declare readonly descriptor: EntityDescriptor<T>;

    public get sortKeys() {
        return this.descriptor.sortKeys;
    }

    public get displayProps() {
        return this.descriptor.displayProps;
    }
}

export interface EntityConstructor<T extends EntityConfig = any> extends ObjectSchemaStatic<T> {
    readonly descriptor: EntityDescriptor<T>;
    new <TNullable extends boolean = false>(
        config?: ObjectSchemaOptions<T['props'], T['type']>,
    ): EntitySchema<T & { nullable: TNullable }>;
}

export type EntityConstructorAny = EntityConstructor<any>;

export interface EntityDefinition<
    T extends EntityConfig = EntityConfig,
    TApi extends EntityApi<T> = EntityApi<T> & ApiMethods,
> extends EntityConstructor<T> {
    readonly api: TApi;

    ref<TNullable extends boolean>(
        config: NullableSchemaConfig<EntityRefOf<EntityDefinition<T>>, TNullable>,
    ): EntityRefSchema<EntityDefinition<T>, TNullable>;
}

export type EntityDefinitionAny = EntityDefinition<any, any>;

export type EntityDefinitionBasic<T extends EntityConfig = EntityConfig> = EntityDefinition<
    T,
    EntityApiBasic<T>
>;

export type EntityDefinitionBasicAny = EntityDefinitionBasic<any>;

type EntityConfigFromParams<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TBase extends EntityConfig,
    TKind extends ObjectKind,
> = Simplify<{
    props: Flatten<TBase['props'] & TProps & EntityProps>;
    type: TType;
    meta: Flatten<TBase['meta'] & TMeta & EntityMetaProps>;
    kind: TKind;
}>;

export namespace EntitySchema {
    export function define<
        TProps extends ObjectProps,
        TType extends string,
        TMeta extends ObjectProps = SomeObject,
        TBase extends EntityConfig = EntityConfigDefault,
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineEntityOptions<TProps, TType, TMeta, TBase, TApiConfig, TApiCustom, 'sealed'> &
            DefineSealedObjectOptions,
    ): EntityDefinition<
        EntityConfigFromParams<TProps, TType, TMeta, TBase, 'sealed'>,
        EntityApiConfigToMethods<
            EntityConfigFromParams<TProps, TType, TMeta, TBase, 'sealed'>,
            TApiConfig
        > &
            TApiCustom
    >;
    export function define<
        TProps extends ObjectProps,
        TType extends string,
        TMeta extends ObjectProps = SomeObject,
        TBase extends EntityConfig = EntityConfigDefault,
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineEntityOptions<TProps, TType, TMeta, TBase, TApiConfig, TApiCustom, 'open'> &
            DefineOpenObjectOptions,
    ): EntityDefinition<
        EntityConfigFromParams<TProps, TType, TMeta, TBase, 'open'>,
        EntityApiConfigToMethods<
            EntityConfigFromParams<TProps, TType, TMeta, TBase, 'open'>,
            TApiConfig
        > &
            TApiCustom
    >;
    export function define<
        TProps extends ObjectProps,
        TMeta extends ObjectProps = SomeObject,
        TBase extends EntityConfig = EntityConfigDefault,
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineEntityOptions<
            TProps,
            string,
            TMeta,
            TBase,
            TApiConfig,
            TApiCustom,
            'abstract'
        > &
            DefineAbstractObjectOptions,
    ): EntityDefinition<
        EntityConfigFromParams<TProps, string, TMeta, TBase, 'abstract'>,
        EntityApiConfigToMethods<
            EntityConfigFromParams<TProps, string, TMeta, TBase, 'abstract'>,
            TApiConfig
        > &
            TApiCustom
    >;
    export function define<
        TProps extends ObjectProps,
        TType extends string,
        TMeta extends ObjectProps,
        TBase extends EntityConfig,
        TApiConfig extends EntityApiConfig,
        TApiCustom extends ApiMethodsAny,
    >(config: DefineEntityOptions<TProps, TType, TMeta, TBase, TApiConfig, TApiCustom, any>) {
        const descriptor = new EntityDescriptor<EntityConfig>({
            type: config.type,
            kind: getObjectKind(config),
            base: config.base?.descriptor as unknown as ObjectDescriptor | undefined,
            props: { ...EntityProps, ...config.props },
            meta: { ...EntityMetaProps, ...config.meta },
            name: config.name,
            displayProps: config.displayProps,
            sortKeys: config.sortKeys as EntityDescriptor['sortKeys'],
            validate: config.validate as EntityDescriptor['validate'],
        });

        const base = config.base ?? EntitySchema;

        const def = defineObjectConstructor(
            base as unknown as ObjectSchemaConstructor,
            descriptor,
        ) as EntityDefinitionAny;

        def.ref = config => {
            return new EntityRefSchema({
                ...config,
                entity: def,
            });
        };

        const api = createEntityApi(config.api || {}, def);
        if (config.apiCustom) {
            Object.assign(api, config.apiCustom(def as any));
        }

        writable(def).api = api as any;

        return def;
    }
}

export type EntityConfigOf<T extends EntityDefinitionAny | EntitySchemaAny> =
    T extends EntityDefinition<infer C> ? C : T extends EntitySchema<infer C> ? C : never;
