import { ConfigDefault } from '@nzyme/types';

import { ObjectConfig, ObjectKind } from '../object/ObjectConfig.js';
import { ObjectProps } from '../object/ObjectProps.js';

import { EntityMetaProps, EntityProps } from './Entity.js';

export interface EntityConfig extends ObjectConfig {
    props: EntityProps & ObjectProps;
    meta: EntityMetaProps & ObjectProps;
}

export type EntityConfigDefault<T extends Partial<EntityConfig> = {}> = ConfigDefault<
    EntityConfig,
    T,
    { type: string; props: EntityProps; meta: EntityMetaProps; kind: ObjectKind }
>;

export interface EntityConfigAny {
    type: string;
    props: any;
    meta: any;
    kind: any;
}

export interface EntitySchemaConfig extends EntityConfig {
    nullable: boolean;
}
