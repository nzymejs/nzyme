import { defineInjectable } from '@nzyme/ioc';

import { EntityDefinition } from './EntitySchema.js';
import { isEntity } from './EntityUtils.js';

export type EntityProvider = ReturnType<typeof createEntityProvider>;

export const EntityProvider = defineInjectable<EntityProvider>({
    name: 'EntityProvider',
});

export function createEntityProvider(schemas: unknown[]) {
    const entities = new Map<string, EntityDefinition>();

    for (const schema of schemas) {
        if (isEntity(schema)) {
            entities.set(schema.typename, schema);
        }
    }

    return {
        getById,
        getAll,
    };

    function getById(id: string): EntityDefinition | undefined {
        return entities.get(id);
    }

    function getAll() {
        return entities.values();
    }
}
