import { Maybe } from '@nzyme/types';
import { mapNotNull } from '@nzyme/utils';
import {
    createError,
    singleError,
    CommonErrors,
    ValidationContext,
    ValidationErrorsMap,
} from '@nzyme/validation';

import {
    SchemaAny,
    Schema,
    SchemaOptions,
    SchemaDefaults,
    SchemaDeserializeOptions,
    SchemaSerializeOptions,
    SchemaVisitor,
    SchemaVisitorResult,
    SchemaValue,
    SchemaQuery,
} from './Schema.js';
import { GenericDescriptor } from './SchemaDescriptor.js';
import { toGetter } from './SchemaUtils.js';

export interface ArraySchemaConfig<TSchema extends SchemaAny>
    extends SchemaOptions<SchemaValue<TSchema>[]>,
        SchemaDefaults<SchemaValue<TSchema>[]> {
    item: TSchema;
}

export class ArraySchema<TSchema extends SchemaAny = SchemaAny> extends Schema<
    SchemaValue<TSchema>[],
    SchemaQuery<TSchema>[]
> {
    public static readonly descriptor = new GenericDescriptor({
        type: 'Array',
        name: 'Array of items',
        graphqlType: undefined,
    });

    public readonly itemSchema: TSchema;

    constructor(config: ArraySchemaConfig<TSchema>);
    constructor(itemSchema: TSchema);
    constructor(configOrItem: ArraySchemaConfig<TSchema> | TSchema) {
        const config: ArraySchemaConfig<TSchema> =
            configOrItem instanceof Schema ? { item: configOrItem } : configOrItem;

        super(config);
        this.itemSchema = config.item;

        if (config.default) {
            this.defaultValue = toGetter(config.default);
        }
    }

    public get descriptor() {
        return ArraySchema.descriptor;
    }

    public override get typename() {
        return `[${this.itemSchema.typename}]`;
    }

    public defaultValue(): SchemaValue<TSchema>[] {
        return [];
    }

    public is(obj: unknown): obj is SchemaValue<TSchema>[] {
        return Array.isArray(obj);
    }

    public coerce(
        value: (SchemaValue<TSchema> | null | undefined)[] | null | undefined,
    ): SchemaValue<TSchema>[] {
        if (value == null) {
            return this.defaultValue();
        }

        return mapNotNull(value, v => this.itemSchema.coerce(v));
    }

    public override validate(value: unknown, ctx: ValidationContext = {}) {
        if (!Array.isArray(value)) {
            return singleError({
                code: CommonErrors.WrongType,
            });
        }

        let errors: ValidationErrorsMap | undefined;
        for (let i = 0; i < value.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const item = value[i];
            if (item == null) {
                (errors || (errors = {}))[i] = createError({
                    code: CommonErrors.Required,
                });
                continue;
            }

            const validation = this.itemSchema.validate(item, ctx);
            if (validation) {
                (errors || (errors = {}))[i] = validation;
            }
        }

        if (errors) {
            return errors;
        }

        return super.validate(value, ctx);
    }

    public create(value: SchemaValue<TSchema>): SchemaValue<TSchema> {
        return value;
    }

    public override serialize(
        value: SchemaValue<TSchema>[],
        opts?: SchemaSerializeOptions<false>,
    ): unknown;
    public override serialize(
        value: SchemaQuery<TSchema>[],
        opts?: SchemaSerializeOptions<true>,
    ): unknown;
    public override serialize(
        value: SchemaValue<TSchema>[] | SchemaQuery<TSchema>[],
        opts?: SchemaSerializeOptions,
    ) {
        return value.map(v => this.itemSchema.serialize(v, opts));
    }

    public override deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<false>,
    ): SchemaValue<TSchema>[];
    public override deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<true>,
    ): SchemaQuery<TSchema>[];
    public override deserialize(value: unknown, opts?: SchemaDeserializeOptions) {
        if (Array.isArray(value)) {
            return value.map(v => this.itemSchema.deserialize(v, opts));
        }

        return [];
    }

    public override visit(
        value: Maybe<SchemaValue<TSchema>[]>,
        visitor: SchemaVisitor,
    ): SchemaVisitorResult {
        if (super.visit(value, visitor)) {
            return true;
        }

        if (!value) {
            return;
        }

        for (const item of value) {
            if (this.itemSchema.visit(item, visitor)) {
                return true;
            }
        }
    }

    // TODO write a proper stringify
    public stringify(value: SchemaValue<TSchema>[]): string {
        return JSON.stringify(value);
    }
}

export function array<TSchema extends SchemaAny>(
    opts: ArraySchemaConfig<TSchema>,
): ArraySchema<TSchema>;
export function array<TSchema extends SchemaAny>(itemSchema: TSchema): ArraySchema<TSchema>;
export function array<TSchema extends SchemaAny>(
    opts: ArraySchemaConfig<TSchema> | TSchema,
): ArraySchema<TSchema> {
    if (opts instanceof Schema) {
        return new ArraySchema<TSchema>({
            item: opts as any,
        });
    }

    return new ArraySchema(opts);
}
