import { ObjectSchema as ObjectSchemaBase } from './ObjectSchema.js';
import { defineObjectSchema } from './defineObject.js';

export {
    ObjectSchemaAny,
    ObjectDescriptor,
    ObjectJson,
    ObjectDescriptorAny,
    isObjectSchemaDefinition,
} from './ObjectSchema.js';

export { ObjectProps } from './ObjectProps.js';

export * from './ObjectConfig.js';

export type ObjectSchema = ObjectSchemaBase;
export const ObjectSchema = Object.assign(ObjectSchemaBase, {
    define: defineObjectSchema,
});
