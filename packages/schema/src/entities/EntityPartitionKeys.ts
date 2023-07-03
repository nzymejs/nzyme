import { TypeName } from '../Typed.js';
import { ObjectValue } from '../object/ObjectSchema.js';

import { Entity } from './Entity.js';
import { EntityConfig } from './EntityConfig.js';

export type EntityPartitionType = string | number | boolean | Date | bigint | Entity;

type EntityNotPartitionKeys = 'id' | number | symbol | TypeName;
type EntityPartitionable<T extends object> = {
    [K in keyof T as T[K] extends EntityPartitionType
        ? Exclude<K, EntityNotPartitionKeys>
        : never]: T[K];
};

export type EntityPartitionKeys<T extends EntityConfig> = keyof EntityPartitionable<ObjectValue<T>>;
