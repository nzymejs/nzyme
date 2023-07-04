import { ObjectSchema as ObjectSchemaBase } from './ObjectSchema.js';
import { defineObjectSchema } from './defineObject.js';

export { ObjectDescriptor, ObjectJson, isObjectSchemaDefinition } from './ObjectSchema.js';
export type { ObjectSchemaAny, ObjectDescriptorAny } from './ObjectSchema.js';

export type { ObjectProps } from './ObjectProps.js';

export * from './ObjectConfig.js';

export type ObjectSchema = ObjectSchemaBase;
export const ObjectSchema = Object.assign(ObjectSchemaBase, {
    define: defineObjectSchema,
});
