import { EntityDescriptor } from './EntityDescriptor.js';
import { EntityDefinition, EntityDefinitionBasic } from './EntitySchema.js';

export function isEntity(value: unknown): value is EntityDefinition {
    const entity = value as EntityDefinition;
    return typeof value === 'function' && entity.descriptor instanceof EntityDescriptor;
}

export function isEntityBasic(value: unknown): value is EntityDefinitionBasic {
    // TODO
    return isEntity(value);
}
