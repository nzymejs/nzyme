import { EntityProps } from './Entity.js';
import { EntityConfig } from './EntityConfig.js';
import { EntityPartitionKeys } from './EntityPartitionKeys.js';
import { EntitySortKey } from './EntitySortKeys.js';

export interface EntityViewParams<
    TEntity extends EntityConfig,
    TPartition extends EntityPartitionKeys<TEntity>,
    TSort extends EntitySortKey<TEntity>,
> {
    name: string;
    entity: TEntity;
    partitionKey: TPartition;
    sortKeys?: TSort[];
}

export class EntityView<
    TEntity extends EntityConfig,
    TPartition extends EntityPartitionKeys<TEntity>,
    TSort extends EntitySortKey<TEntity>,
> {}

export function entityView<
    TEntity extends EntityConfig,
    TPartition extends EntityPartitionKeys<TEntity>,
    TSort extends EntitySortKey<TEntity> = never,
>(params: EntityViewParams<TEntity, TPartition, TSort>) {
    return new EntityView<TEntity, TPartition, TSort>();
}
