import { DateTimeSchema } from '../DateTimeSchema.js';
import { SchemaQuery, SchemaValue } from '../Schema.js';
import { StringSchema } from '../StringSchema.js';
import { ObjectProps, ObjectSchema } from '../object/index.js';
import translations from '../translations.js';

export const EntityProps = {
    id: new StringSchema({
        name: 'Entity ID',
    }),
};

export type EntityProps = typeof EntityProps;
export type EntityPropsAny = EntityProps & ObjectProps;

export const EntityMetaProps = {
    _createdOn: new DateTimeSchema({
        name: translations.get('CreatedOn'),
    }),

    _updatedOn: new DateTimeSchema({
        name: translations.get('UpdatedOn'),
    }),
};

export type EntityMetaProps = typeof EntityMetaProps;

export const Entity = ObjectSchema.define({
    type: 'Entity',
    abstract: true,
    props: EntityProps,
    meta: EntityMetaProps,
});

export type Entity = SchemaValue<typeof Entity>;
export type EntityWithMeta = SchemaQuery<typeof Entity>;
export type EntityAny = Entity & { [key: string]: unknown };
export type EntityQueryAny = SchemaQuery<typeof Entity> & { [key: string]: unknown };
