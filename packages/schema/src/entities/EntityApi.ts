import { EmptyObject, Flatten, NonVoidProps } from '@nzyme/types';

import { ApiMethod, ApiMethodsAny } from '../ApiMethod.js';
import { ArraySchema } from '../ArraySchema.js';
import { EnumSchema, EnumSchemaValueConfig } from '../EnumSchema.js';
import { InputObjectSchema } from '../InputObjectSchema.js';
import { IntSchema } from '../IntSchema.js';
import { JsonObjectSchema } from '../JsonObjectSchema.js';
import { SortOrder } from '../SortOrder.js';
import { StringSchema } from '../StringSchema.js';
import { ValidationErrorsSchema } from '../ValidationErrors.js';
import { VoidSchema } from '../VoidSchema.js';
import { ObjectSchema } from '../object/index.js';

import { EntityConfig } from './EntityConfig.js';
import { EntityConstructor } from './EntitySchema.js';
import { EntitySortKey } from './EntitySortKeys.js';

const MAX_PAGE = 100;

export const EntityApiSymbols = {
    get: Symbol('entity:get'),
    list: Symbol('entity:list'),
    put: Symbol('entity:put'),
    delete: Symbol('entity:delete'),
};

export interface EntityApiMethodConfig {
    // TODO add auth settings
    auth?: string;
}

export interface EntityApiConfig {
    get?: EntityApiMethodConfig;
    list?: EntityApiMethodConfig;
    put?: EntityApiMethodConfig | false;
    delete?: EntityApiMethodConfig | false;
}

export type EntityApiConfigToMethods<
    T extends EntityConfig = EntityConfig,
    TApiDefault extends EntityApiConfig = EmptyObject,
> = EntityApi<T> &
    Flatten<
        NonVoidProps<{
            put: TApiDefault['put'] extends false ? void : EntityPutApi<T>;
            delete: TApiDefault['delete'] extends false ? void : EntityDeleteApi<T>;
        }>
    >;

export type EntityApi<T extends EntityConfig = EntityConfig> = {
    get: EntityGetApi<T>;
    list: EntityListApi<T>;
};

export type EntityApiBasic<T extends EntityConfig = EntityConfig> = EntityApi<T> & {
    put: EntityPutApi<T>;
    delete: EntityDeleteApi<T>;
};

export type EntityGetApi<T extends EntityConfig = EntityConfig> = ReturnType<
    typeof createEntityGetApi<T>
>;

export type EntityListApi<T extends EntityConfig = EntityConfig> = ReturnType<
    typeof createEntityListApi<T>
>;

export type EntityPutApi<T extends EntityConfig = EntityConfig> = ReturnType<
    typeof createEntityPutApi<T>
>;

export type EntityDeleteApi<T extends EntityConfig = EntityConfig> = ReturnType<
    typeof createEntityDeleteApi<T>
>;

export function createEntityApi<T extends EntityConfig, TApiDefault extends EntityApiConfig>(
    config: TApiDefault,
    entity: EntityConstructor<T>,
) {
    const api: ApiMethodsAny = {};

    api.get = createEntityGetApi(entity);
    api.list = createEntityListApi(entity);

    if (config.put !== false) {
        api.put = createEntityPutApi(entity);
    }

    if (config.delete !== false) {
        api.delete = createEntityDeleteApi(entity);
    }

    return api as EntityApiConfigToMethods<T, TApiDefault>;
}

function createEntityGetApi<T extends EntityConfig = EntityConfig>(entity: EntityConstructor<T>) {
    const getParams = InputObjectSchema.define({
        type: `${entity.typename}_GetParams`,
        props: {
            id: new StringSchema({
                name: `ID of ${entity.typename} entity`,
            }),
        },
    });

    return new ApiMethod({
        type: 'query',
        description: `Gets entity ${entity.typename} by ID. Will return null if not found.`,
        symbol: EntityApiSymbols.get,
        input: new getParams(),
        result: new entity({
            nullable: true,
        }),
    });
}

function createEntityListApi<T extends EntityConfig = EntityConfig>(entity: EntityConstructor<T>) {
    const listParams = InputObjectSchema.define({
        type: `${entity.typename}_ListParams`,
        name: `List params for ${entity.typename} entity`,
        props: {
            sortBy: createEntitySortKeysSchema(entity),
            sortOrder: new SortOrder({
                name: `Sorting order`,
                nullable: true,
            }),
            pageSize: new IntSchema({
                name: `Number of results to return. Maximum value is ${MAX_PAGE}`,
                nullable: true,
                min: 1,
                max: MAX_PAGE,
                default: 10,
            }),
            pageToken: new StringSchema({
                name: 'Token to load a specific page.',
                nullable: true,
            }),
        },
    });

    const listResult = ObjectSchema.define({
        type: `${entity.typename}_ListResult`,
        name: `List result for ${entity.typename} entity`,
        props: {
            entities: new ArraySchema({
                item: new entity(),
                name: 'List of the entities queried.',
            }),
            pageNext: new StringSchema({
                name: 'Token for the next page. If null there is no page after this one.',
                nullable: true,
            }),
            pagePrevious: new StringSchema({
                name: 'Token for the previous page. If null there is no page after this one.',
                nullable: true,
            }),
        },
    });

    return new ApiMethod({
        type: 'query',
        description: `Lists entites of type ${entity.typename}. Supports sorting by predefined fields`,
        symbol: EntityApiSymbols.list,
        input: new listParams(),
        result: new listResult(),
    });
}

function createEntityPutApi<T extends EntityConfig = EntityConfig>(entity: EntityConstructor<T>) {
    const putParams = InputObjectSchema.define({
        type: `${entity.typename}_PutParams`,
        name: `Put params for ${entity.typename} entity`,
        props: {
            data: new JsonObjectSchema({
                name: `Data object to create or update ${entity.typename} entity`,
            }),
        },
    });

    const putResult = ObjectSchema.define({
        type: `${entity.typename}_PutResult`,
        name: `Result of put operation for ${entity.typename} entity.`,
        props: {
            entity: new entity({
                nullable: true,
                name: 'Added or modified entity.',
            }),
            errors: ValidationErrorsSchema,
        },
    });

    return new ApiMethod({
        type: 'mutation',
        description: `Creates or updates ${entity.typename} entity.`,
        symbol: EntityApiSymbols.put,
        input: new putParams(),
        result: new putResult(),
    });
}

function createEntityDeleteApi<T extends EntityConfig = EntityConfig>(
    entity: EntityConstructor<T>,
) {
    const deleteParams = InputObjectSchema.define({
        type: `${entity.typename}_DeleteParams`,
        props: {
            id: new StringSchema({
                name: `ID of ${entity.typename} entity to delete.`,
            }),
        },
    });

    return new ApiMethod({
        type: 'mutation',
        description: `Deletes entity ${entity.typename} by ID. Returns deleted entity or null if entity not found.`,
        symbol: EntityApiSymbols.delete,
        input: new deleteParams(),
        result: new entity({
            nullable: true,
        }),
    });
}

function createEntitySortKeysSchema<T extends EntityConfig = EntityConfig>(
    entity: EntityConstructor<T>,
) {
    const sortKeys = entity.descriptor.sortKeys;
    if (!sortKeys.length) {
        return new VoidSchema() as unknown as EnumSchema<EntitySortKey<T>, true>;
    }

    type SortKey = EntitySortKey<T>;
    const values = {} as Record<SortKey, EnumSchemaValueConfig>;

    for (const field of sortKeys) {
        const prop = entity.props[field] ?? entity.meta[field];
        if (prop) {
            values[field] = {
                name: `Sort by property "${field}"`,
            };
        }
    }

    const schema = EnumSchema.define({
        type: `${entity.typename}_SortKeys`,
        name: `Sortable fields for ${entity.typename} entity`,
        values,
    });

    return new schema({
        name: `By which field you want to sort the result`,
        nullable: true,
    });
}
