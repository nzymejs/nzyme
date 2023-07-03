import { cachedGetter } from '@nzyme/utils';

import { ArraySchema } from '../ArraySchema.js';
import { SchemaValue } from '../Schema.js';
import { StringSchema } from '../StringSchema.js';
import { TypeName } from '../Typed.js';
import { ObjectSchema } from '../object/index.js';

import { EntitySchema, EntitySchemaAny } from './EntitySchema.js';

export const getEntityListResultSchema = cachedGetter(createEntityListResultSchema);

function createEntityListResultSchema<TSchema extends EntitySchemaAny>(entity: TSchema) {
    const listResult = ObjectSchema.define({
        type: `${entity.typename}_ListResult`,
        name: `List result for ${entity.typename} entity`,
        props: {
            entities: new ArraySchema({
                item: entity,
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

    return new listResult();
}

export type EntityListResultSchema<TSchema extends EntitySchemaAny = EntitySchemaAny> = ReturnType<
    typeof createEntityListResultSchema<TSchema>
>;

export type EntityListResult<TSchema extends EntitySchemaAny = EntitySchemaAny> = SchemaValue<
    EntityListResultSchema<TSchema>
>;

export interface EntityListResultPartial<T>
    extends Omit<EntityListResult<EntitySchema>, 'entities' | TypeName> {
    entities: T[];
}
