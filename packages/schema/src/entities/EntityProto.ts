import { DefaultConstructor, Simplify, SomeObject } from '@nzyme/types';
import { getBaseClass } from '@nzyme/utils';

import { ApiMethodsAny } from '../ApiMethod.js';
import { NullableSchemaConfig } from '../NullableSchema.js';
import { Schema, SchemaAny } from '../Schema.js';
import { SchemaError } from '../SchemaError.js';
import { Typed } from '../Typed.js';
import { ObjectKind } from '../object/ObjectConfig.js';
import {
    DefineAbstractObjectOptions,
    DefineOpenObjectOptions,
    DefineSealedObjectOptions,
} from '../object/defineObject.js';

import { EntityMetaProps, EntityProps } from './Entity.js';
import { EntityApiConfig } from './EntityApi.js';
import { EntityConfigDefault } from './EntityConfig.js';
import { EntityRefSchema } from './EntityRef.js';
import { DefineEntityOptions, EntityDefinition, EntitySchema } from './EntitySchema.js';

type ProtoProps<T extends Typed> = Simplify<
    {
        readonly [K in keyof T as T[K] extends SchemaAny | EntityProtoRef<any, any>
            ? K
            : never]: T[K] extends SchemaAny
            ? T[K]
            : T[K] extends EntityProtoRef<infer TProto2, infer TNullable>
            ? EntityRefSchema<ProtoEntityDefinition<TProto2>, TNullable>
            : never;
    } & EntityProps
>;

type DefineProtoOptions<
    TProto extends Typed,
    TApiConfig extends EntityApiConfig,
    TApiCustom extends ApiMethodsAny,
    TKind extends ObjectKind,
> = Omit<
    DefineEntityOptions<
        ProtoProps<TProto>,
        TProto['__typename'],
        {},
        EntityConfigDefault,
        TApiConfig,
        TApiCustom,
        TKind
    >,
    'props' | 'meta' | 'type'
>;

type ProtoEntityDefinition<T extends Typed> = EntityDefinition<{
    props: ProtoProps<T>;
    meta: EntityMetaProps;
    type: T['__typename'];
    kind: ObjectKind;
}>;

export class EntityProto<TProto extends Typed> {
    public readonly props: ProtoProps<TProto>;
    public readonly typename: TProto['__typename'];

    private _entity: ProtoEntityDefinition<TProto> | undefined;

    public get entity(): ProtoEntityDefinition<TProto> {
        if (!this._entity) {
            throw new SchemaError(
                'Entity is not yet initialized. Make sure you initialize entities in a proper order.',
            );
        }

        return this._entity;
    }

    constructor(public readonly proto: DefaultConstructor<TProto>) {
        const protoObj = new proto();

        this.typename = protoObj.__typename;
        this.props = {} as ProtoProps<TProto>;

        type PropKey = keyof typeof this.props;
        type PropValue = (typeof this.props)[PropKey];

        for (const propKey of Object.keys(protoObj)) {
            const prop: unknown = protoObj[propKey as keyof typeof protoObj];

            if (prop instanceof Schema) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.props[propKey as PropKey] = prop as PropValue;
            } else if (prop instanceof EntityProtoRef) {
                const ref = new EntityRefSchema({
                    entity: () => getEntityProto(prop.proto).entity,
                    ...prop.config,
                });

                this.props[propKey as PropKey] = ref as PropValue;
            }
        }
    }

    public define<
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineProtoOptions<TProto, TApiConfig, TApiCustom, 'sealed'> &
            DefineSealedObjectOptions,
    ): ProtoEntityDefinition<TProto>;
    public define<
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineProtoOptions<TProto, TApiConfig, TApiCustom, 'open'> &
            DefineOpenObjectOptions,
    ): ProtoEntityDefinition<TProto>;
    public define<
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineProtoOptions<TProto, TApiConfig, TApiCustom, 'abstract'> &
            DefineAbstractObjectOptions,
    ): ProtoEntityDefinition<TProto>;
    public define<
        TApiConfig extends EntityApiConfig = SomeObject,
        TApiCustom extends ApiMethodsAny = SomeObject,
    >(
        config: DefineProtoOptions<TProto, TApiConfig, TApiCustom, any>,
    ): ProtoEntityDefinition<TProto> {
        if (this._entity) {
            throw new SchemaError(
                'Entity is already initialized. You can only initialize entity once',
            );
        }

        const baseProtoClass = getBaseClass(this.proto);
        const baseProto =
            baseProtoClass === Object ? null : getEntityProto(baseProtoClass as DefaultConstructor);

        const entity = EntitySchema.define({
            type: this.typename,
            props: this.props as any,
            base: baseProto?.entity as any,
            ...(config as any),
        });

        this._entity = entity as unknown as ProtoEntityDefinition<TProto>;

        return this._entity;
    }
}

const symbol = Symbol('proto');

export function getEntityProto<T extends Typed>(proto: DefaultConstructor<T>): EntityProto<T> {
    if (Object.hasOwn(proto, symbol)) {
        return (proto as any)[symbol];
    }

    const entityProto = new EntityProto(proto);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proto as any)[symbol] = entityProto;

    return entityProto;
}

interface EntityProtoRefOptions<TProto extends Typed, TNullable extends boolean = false>
    extends NullableSchemaConfig<unknown, TNullable> {
    readonly proto: DefaultConstructor<TProto>;
}

export class EntityProtoRef<TProto extends Typed, TNullable extends boolean = false> {
    public readonly proto: DefaultConstructor<TProto>;
    public readonly config: NullableSchemaConfig<unknown, TNullable>;

    constructor(options: EntityProtoRefOptions<TProto, TNullable>) {
        this.proto = options.proto;
        this.config = options;
    }
}
