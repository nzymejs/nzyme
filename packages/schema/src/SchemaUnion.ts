// import { GraphQLUnionType } from 'graphql';

// import { cachedProp } from '@nzyme/utils';
// import {
//     singleError,
//     CommonErrors,
//     ValidationErrors,
//     ValidationContext,
// } from '@nzyme/validation';

// import { Schema, SchemaConfig, SchemaValue, SchemaDefaults } from './Schema.js';
// import { ObjectSchema } from './ObjectSchema.js';
// import { toGetter } from './SchemaUtils.js';
// import { Typed } from './Typed.js';

// export interface SchemaUnionConfig<T extends Typed> extends SchemaConfig<T>, SchemaDefaults<T> {
//     name: string;
//     schemas: readonly ObjectSchema<T>[];
// }

// export interface SchemaUnionOptions<T extends SchemaConfig<any>>
//     extends SchemaConfig<SchemaValue<T>> {
//     name: string;
//     schemas: readonly T[];
//     default?: SchemaValue<T> | (() => SchemaValue<T>);
// }

// export class SchemaUnion<T extends Typed> extends Schema<T> {
//     public readonly name: string;
//     public readonly schemas: readonly ObjectSchema<T>[];

//     constructor(config: SchemaUnionConfig<T>) {
//         super(config);
//         this.name = config.name;
//         this.schemas = config.schemas;
//         this.defaultValue = toGetter(config.default || config.schemas[0].defaultValue);
//     }

//     public readonly defaultValue: () => T;

//     public is(value: unknown): value is T {
//         for (const schema of this.schemas) {
//             if (schema.is(value)) {
//                 return true;
//             }
//         }

//         return false;
//     }

//     public override validate(value: unknown, ctx: ValidationContext): ValidationErrors<T> | null {
//         if (value == null) {
//             return singleError<T>({
//                 code: CommonErrors.Required,
//             });
//         }

//         const errors = this.validateCore(value, ctx);
//         if (errors) {
//             return errors;
//         }

//         return super.validate(value, ctx);
//     }

//     private validateCore(value: unknown, ctx: ValidationContext) {
//         for (const schema of this.schemas) {
//             if (schema.is(value)) {
//                 return schema.validate(value, ctx);
//             }
//         }

//         return singleError<T>({
//             code: CommonErrors.WrongType,
//         });
//     }
// }

// export function union<T extends ObjectSchema<any>>(
//     config: SchemaUnionOptions<T>
// ): SchemaUnion<SchemaValue<T>> {
//     return new SchemaUnion(config);
// }
