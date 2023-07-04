import { GraphQLFieldConfigArgumentMap, GraphQLInputObjectType, assertInputType } from 'graphql';

import { translate } from '@nzyme/i18n';
import { Maybe, Strict } from '@nzyme/types';
import { asArray, Nullable } from '@nzyme/utils';
import {
    CommonErrors,
    createError,
    singleError,
    ValidableConfig,
    validateWithMany,
    ValidationContext,
    ValidationErrorsMap,
    Validator,
} from '@nzyme/validation';

import { NullableSchema, NullableSchemaConfig } from './NullableSchema.js';
import {
    SchemaAny,
    SchemaOptions,
    SchemaDeserializeOptions,
    SchemaSerializeOptions,
    SchemaValue,
    SchemaVisitor,
    SchemaVisitorResult,
} from './Schema.js';
import { SchemaDescriptor, SchemaDescriptorConfig } from './SchemaDescriptor.js';
import { assertTypeName, getTypeName, wrapWithType } from './SchemaUtils.js';
import { GRAPHQL } from './env.js';

export interface InputObjectSchemaOptions<
    TProps extends InputObjectProps = InputObjectProps,
    TNullable extends boolean = boolean,
> extends NullableSchemaConfig<InputObjectValue<TProps>, TNullable> {
    default?: () => InputObjectValue<TProps>;
}

export type InputObjectValue<TProps extends InputObjectProps = InputObjectProps> = {
    [K in keyof TProps]: TProps[K] extends SchemaAny ? SchemaValue<TProps[K]> : never;
};

type NullableInputObject<TProps extends InputObjectProps, TNullable extends boolean> = Nullable<
    InputObjectValue<TProps>,
    TNullable
>;

export type InputObjectProps = Record<string, SchemaAny>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputObjectSchemaAny = InputObjectSchema<any, any>;

export interface InputObjectDescriptorConfig<TProps extends InputObjectProps>
    extends SchemaDescriptorConfig,
        ValidableConfig<Strict<InputObjectValue<TProps>>> {
    props: TProps;
}

export class InputObjectDescriptor<
    TProps extends InputObjectProps = InputObjectProps,
> extends SchemaDescriptor {
    public readonly props: TProps;
    public readonly validators: readonly Validator<InputObjectValue<TProps>>[];
    public readonly graphqlType: GraphQLInputObjectType | undefined;

    constructor(config: InputObjectDescriptorConfig<TProps>) {
        super({
            type: config.type,
            name: config.name,
        });

        this.props = config.props;
        this.validators = config.validate ? asArray(config.validate) : [];

        if (GRAPHQL) {
            this.graphqlType = createInputGraphqlType(this);
        }
    }

    public defaultValue(): InputObjectValue<TProps> {
        const value = {} as InputObjectValue<TProps>;
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = prop.defaultValue();
            value[key as keyof typeof value] = propValue;
        }

        return value;
    }

    public is(value: unknown): value is InputObjectValue<TProps> {
        return typeof value === 'object';
    }

    public coerce(
        value: Maybe<Partial<InputObjectValue<TProps>>>,
    ): InputObjectValue<TProps> | null {
        if (value == null) {
            return null;
        }

        const result = {} as InputObjectValue<TProps>;
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = value[key];
            result[key as keyof typeof result] = prop.coerce(propValue);
        }

        return result;
    }

    public async validate<TValue>(value: TValue, ctx: ValidationContext) {
        // Check if proper type
        if (!this.is(value)) {
            return singleError({
                code: CommonErrors.WrongType,
            });
        }

        return await this.validateCore(value as InputObjectValue<TProps>, ctx);
    }

    private async validateCore(value: InputObjectValue<TProps>, ctx: ValidationContext) {
        const errors = await this.validateProps(value, ctx);
        if (errors) {
            return errors;
        }

        // Run custom validation only if properties are valid
        return validateWithMany(value, this.validators, ctx);
    }

    private async validateProps(value: InputObjectValue<TProps>, ctx: ValidationContext) {
        let errors: ValidationErrorsMap | undefined;
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = value[key as keyof typeof value];
            const propErrors = await prop.validate(propValue, ctx);

            if (propErrors) {
                (errors || (errors = {}))[key] = propErrors;
            }
        }

        // Check for unknown properties
        for (const prop of Object.keys(value)) {
            // already checked at the beginning of validation
            if (prop === '__typename') {
                continue;
            }

            // is not unknown prop
            if (this.props[prop as keyof TProps]) {
                continue;
            }

            (errors || (errors = {}))[prop] = createError({
                code: CommonErrors.UnknownProperty,
            });
        }

        return errors;
    }

    public serialize(value: InputObjectValue<TProps>, opts?: SchemaSerializeOptions): unknown {
        if (!value) {
            return null;
        }

        const type = getTypeName(value);

        assertTypeName(type, this.typename);
        const result: Record<string, unknown> = {};

        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = value[key];
            if (propValue === undefined) {
                continue;
            }

            const deserialized = prop.serialize(propValue, opts);
            if (deserialized === undefined) {
                continue;
            }

            result[key] = deserialized;
        }

        return result;
    }

    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions,
    ): InputObjectValue<TProps> | null {
        if (!value || typeof value !== 'object') {
            return null;
        }

        const result = {} as InputObjectValue<TProps>;
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = (value as Record<string, unknown>)[key];

            const deserialized = prop.deserialize(propValue, opts);
            if (deserialized === undefined) {
                continue;
            }

            result[key] = deserialized;
        }

        return result;
    }
}

interface InputObjectSchemaConfig<
    TProps extends InputObjectProps = InputObjectProps,
    TNullable extends boolean = boolean,
> extends NullableSchemaConfig<InputObjectValue<TProps>, TNullable> {
    default?: () => Nullable<InputObjectValue<TProps>, TNullable>;
}

export abstract class InputObjectSchema<
    TProps extends InputObjectProps = InputObjectProps,
    TNullable extends boolean = boolean,
> extends NullableSchema<InputObjectValue<TProps>, TNullable> {
    public abstract override readonly descriptor: InputObjectDescriptor<TProps>;

    constructor(config: InputObjectSchemaConfig<TProps, TNullable>) {
        super(config);

        const defaultValue = config.default;
        if (defaultValue) {
            this.defaultValue = () => {
                const value = defaultValue();
                if (value) {
                    wrapWithType(value, this.typename);
                }

                return value;
            };
        }
    }

    public get props() {
        return this.descriptor.props;
    }

    public defaultValue(): NullableInputObject<TProps, TNullable> {
        if (this.nullable) {
            return null as NullableInputObject<TProps, TNullable>;
        }

        return this.descriptor.defaultValue();
    }

    protected isNonNull(value: unknown): value is InputObjectValue<TProps> {
        return this.descriptor.is(value);
    }

    protected override preValidate(value: unknown, ctx: ValidationContext) {
        return this.descriptor.validate(value, ctx);
    }

    public create(value?: Partial<InputObjectValue<TProps>>): InputObjectValue<TProps> {
        if (value != null) {
            const result = this.coerceNonNull(value);
            if (result != null) {
                return result;
            }
        }

        return this.defaultValue() ?? this.descriptor.defaultValue();
    }

    protected coerceNonNull(
        value: Partial<InputObjectValue<TProps>>,
    ): InputObjectValue<TProps> | null {
        return this.descriptor.coerce(value);
    }

    public override serialize(
        value: InputObjectValue<TProps>,
        opts?: SchemaSerializeOptions,
    ): unknown {
        return this.descriptor.serialize(value, opts);
    }

    public override deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions,
    ): NullableInputObject<TProps, TNullable> {
        return this.descriptor.deserialize(value, opts) ?? this.defaultValue();
    }

    public override visit(
        value: Maybe<InputObjectValue<TProps>>,
        visitor: SchemaVisitor,
    ): SchemaVisitorResult {
        if (super.visit(value, visitor)) {
            return true;
        }

        if (!value) {
            return;
        }

        for (const key in this.props) {
            const prop = this.props[key];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (prop.visit(value[key], visitor)) {
                return true;
            }
        }
    }

    // TODO write a proper stringify
    public stringify(value: InputObjectValue<TProps>): string {
        return JSON.stringify(value);
    }
}

export interface InputObjectSchemaStatic<TSchema extends InputObjectSchemaAny> {
    readonly name: string;
    readonly type: string;
    readonly descriptor: TSchema['descriptor'];
    readonly props: TSchema['props'];

    coerce(value?: Maybe<Partial<SchemaValue<TSchema>>>): SchemaValue<TSchema>;
    is(value: unknown): value is SchemaValue<TSchema>;
}

export interface InputObjectSchemaConstructor<TProps extends InputObjectProps = InputObjectProps>
    extends InputObjectSchemaStatic<InputObjectSchema<TProps>> {
    new <TNullable extends boolean = false>(
        config?: InputObjectSchemaOptions<TProps, TNullable>,
    ): InputObjectSchema<TProps, TNullable>;
}

export interface InputObjectConfig<TProps extends InputObjectProps>
    extends SchemaOptions<InputObjectValue<TProps>> {
    props: TProps;
    type: string;
}

export namespace InputObjectSchema {
    export function define<TProps extends InputObjectProps>(
        config: InputObjectConfig<TProps>,
    ): InputObjectSchemaConstructor<TProps> {
        const descriptor = new InputObjectDescriptor({
            type: config.type,
            props: config.props,
            name: config.name,
            validate: config.validate,
        });

        const constructor = class extends InputObjectSchema<TProps> {
            public readonly descriptor = descriptor;

            constructor(opts: InputObjectSchemaOptions<TProps> = {}) {
                super({
                    name: opts.name || descriptor.name,
                    default: opts.default,
                    validate: opts.validate,
                });
            }
        };

        Object.assign(constructor, {
            type: descriptor.typename,
            descriptor: descriptor,
            props: descriptor.props,
            coerce: descriptor.coerce.bind(descriptor),
            is: descriptor.is.bind(descriptor),
        });

        return constructor as unknown as InputObjectSchemaConstructor<TProps>;
    }
}

function createInputGraphqlType<TProps extends InputObjectProps>(
    descriptor: InputObjectDescriptor<TProps>,
) {
    const fields = {} as GraphQLFieldConfigArgumentMap;

    for (const propName in descriptor.props) {
        const prop = descriptor.props[propName];
        const propType = prop.graphqlType;
        if (!propType) {
            // TODO handle edge case
            continue;
        }

        fields[propName] = {
            type: assertInputType(propType),
            description: translate(prop.name),
        };
    }

    return new GraphQLInputObjectType({
        name: descriptor.typename,
        description: translate(descriptor.name),
        fields: fields,
    });
}
