import { ObjectDescriptor, ObjectDescriptorConfig } from '../object/ObjectSchema.js';

import { Entity } from './Entity.js';
import { EntityConfig, EntityConfigDefault } from './EntityConfig.js';
import { EntitySortKey } from './EntitySortKeys.js';

export interface EntityDescriptorConfig<T extends EntityConfig = EntityConfigDefault>
    extends ObjectDescriptorConfig<T> {
    // TODO: check if index prop is really indexable in runtime (is string or number)
    readonly sortKeys?: readonly EntitySortKey<T>[];
    readonly displayProps?: ReadonlyArray<keyof T['props'] & string>;
}

export type EntityDescriptorAny = EntityDescriptor<any>;

export class EntityDescriptor<T extends EntityConfig = any> extends ObjectDescriptor<T> {
    public readonly sortKeys: readonly EntitySortKey<T>[];
    public readonly displayProps: ReadonlyArray<keyof T['props'] & string>;

    constructor(config: EntityDescriptorConfig<T>) {
        super({
            ...config,
            base: config.base ?? (Entity.descriptor as any),
        });

        let displayProps = config.displayProps;
        let sortKeys = config.sortKeys;

        if (this.base instanceof EntityDescriptor) {
            displayProps ??= this.base.displayProps;
            sortKeys ??= this.base.sortKeys as readonly EntitySortKey<T>[];
        }

        this.displayProps = displayProps ?? [];
        this.sortKeys = sortKeys ?? (['_createdOn', '_updatedOn'] as EntitySortKey<T>[]);
    }
}
