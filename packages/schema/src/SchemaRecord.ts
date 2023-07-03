// import { Dictionary, Maybe } from '@nzyme/types';
// import { mapObject } from '@nzyme/utils';
// import {
//     singleError,
//     CommonErrors,
//     ValidationContext,
//     ValidationErrorsMap,
// } from '@nzyme/validation';

// import { Schema, SchemaConfig, SchemaDefaults, SchemaVisitor, SchemaVisitorResult } from './Schema.js';
// import { GenericDescriptor } from './SchemaDescriptor.js';
// import { toGetter } from './SchemaUtils.js';

// export interface SchemaRecordConfig<TKey extends string | number, TValue>
//     extends SchemaConfig<Dictionary<TKey, TValue>>,
//         SchemaDefaults<Dictionary<TKey, TValue>> {
//     key: Schema<TKey>;
//     value: Schema<TValue>;
// }

// export class SchemaRecord<TKey extends string | number, TValue> extends Schema<
//     Dictionary<TKey, TValue>
// > {
//     public static readonly descriptor = new GenericDescriptor({
//         type: 'Record',
//         name: 'Record of key-value pairs',
//     });

//     public readonly keySchema: Schema<TKey>;
//     public readonly valueSchema: Schema<TValue>;

//     constructor(config: SchemaRecordConfig<TKey, TValue>) {
//         super(config);
//         this.keySchema = config.key;
//         this.valueSchema = config.value;
//         // TODO
//         // this.typeName = `Record<${config.key.typeName}, ${config.value.typeName}>`;
//         this.defaultValue = toGetter(config.default || ({} as Dictionary<TKey, TValue>));
//     }

//     public get descriptor() {
//         return SchemaRecord.descriptor;
//     }

//     public readonly defaultValue: () => Dictionary<TKey, TValue>;

//     public is(obj: unknown): obj is Dictionary<TKey, TValue> {
//         return !(obj instanceof Array) && typeof obj === 'object';
//     }

//     public coerce(value: Partial<Dictionary<TKey, TValue>> | null | undefined) {
//         if (value == null) {
//             return this.defaultValue();
//         }

//         return mapObject(value as Dictionary<TKey, Partial<TValue>>, v =>
//             this.valueSchema.coerce(v),
//         );
//     }

//     public override validate<T>(value: T, ctx: ValidationContext) {
//         if (!this.is(value)) {
//             return singleError({
//                 code: CommonErrors.WrongType,
//             });
//         }

//         let errors: ValidationErrorsMap | null = null;

//         const keySchema = this.keySchema;
//         const valueSchema = this.valueSchema;

//         const keys = Object.keys(value) as TKey[];

//         for (const key of keys) {
//             const keyValidation = keySchema.validate(key, ctx);
//             if (keyValidation) {
//                 (errors || (errors = {}))[key] = keyValidation;
//             }

//             const keyValue = (value as Dictionary<TKey, TValue>)[key];
//             const valueValidation = valueSchema.validate(keyValue, ctx);
//             if (valueValidation) {
//                 (errors || (errors = {}))[key] = valueValidation;
//             }
//         }

//         if (errors) {
//             return errors;
//         }

//         // run custom validation only if properties are valid
//         return super.validate(value, ctx);
//     }

//     public serialize(value: Dictionary<TKey, TValue>) {
//         return mapObject(value, v => this.valueSchema.serialize(v));
//     }

//     public deserialize(value: unknown): Dictionary<TKey, TValue> {
//         return mapObject(value as any, v => this.valueSchema.deserialize(v));
//     }

//     public override visit(
//         value: Maybe<Dictionary<TKey, TValue>>,
//         visitor: SchemaVisitor,
//     ): SchemaVisitorResult {
//         if (super.visit(value, visitor)) {
//             return true;
//         }

//         if (!value) {
//             return;
//         }

//         for (const key in value) {
//             const item = value[key];
//             if (item && this.valueSchema.visit(item, visitor)) {
//                 return true;
//             }
//         }
//     }

//     // TODO write a proper stringify
//     public stringify(value: Dictionary<TKey, TValue>, locale: string): string {
//         return JSON.stringify(value);
//     }
// }

// export function record<TKey extends string | number, TValue>(
//     opts: SchemaRecordConfig<TKey, TValue>,
// ): SchemaRecord<TKey, TValue> {
//     return new SchemaRecord(opts);
// }
