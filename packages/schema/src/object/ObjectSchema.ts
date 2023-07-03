import { GraphQLObjectType } from 'graphql';

import { Flatten, Maybe, Strict, IfAny } from '@nzyme/types';
import { Nullable } from '@nzyme/utils';
import {
    CommonErrors,
    createError,
    mergeValidators,
    singleError,
    ValidableConfig,
    validateWithMany,
    ValidationContext,
    ValidationErrorsMap,
    ValidationException,
    Validator,
} from '@nzyme/validation';

import { createFragment, FragmentFrom, FragmentInput, FragmentProps } from '../Fragment.js';
import { JsonObjectSchema } from '../JsonObjectSchema.js';
import { NullableSchema, NullableSchemaConfig } from '../NullableSchema.js';
import {
    SchemaDeserializeOptions,
    SchemaSerializeOptions,
    SchemaVisitor,
    SchemaVisitorResult,
} from '../Schema.js';
import { SchemaDescriptor, SchemaDescriptorConfig } from '../SchemaDescriptor.js';
import { SchemaError } from '../SchemaError.js';
import { assertTypeName, getTypeName, makeTyped, wrapWithType } from '../SchemaUtils.js';
import { Typed, TypedAny } from '../Typed.js';
import { DEBUG, GRAPHQL } from '../env.js';
import translations from '../translations/index.js';

import { ObjectConfig, ObjectConfigDefault } from './ObjectConfig.js';
import {
    ObjectProps,
    ObjectPropsQuery,
    ObjectPropsValue,
    ObjectPropsValueTyped,
} from './ObjectProps.js';

export interface ObjectSchemaOptions<
    TProps extends ObjectProps = ObjectProps,
    TType extends string = string,
    TNullable extends boolean = boolean,
> extends NullableSchemaConfig<ObjectPropsValueTyped<TProps, TType>, TNullable> {
    default?: () => ObjectPropsValue<TProps>;
}

export const ObjectJson = new JsonObjectSchema({
    name: translations.get('JsonValue'),
});

export type ObjectValue<T extends ObjectConfig = ObjectConfig> = Typed<ObjectType<T>> &
    ObjectPropsValue<T['props']>;

export type ObjectType<T extends ObjectConfig = ObjectConfig> = T['kind'] extends 'sealed'
    ? T['type']
    : string;

export type ObjectDescriptorValue<T extends ObjectDescriptorAny> = T extends ObjectDescriptor<
    infer C
>
    ? ObjectValue<C>
    : never;

type NullableObject<T extends ObjectSchemaConfig> = Nullable<ObjectValue<T>, T['nullable']>;

export type ObjectQuery<T extends ObjectConfig = ObjectConfig> = Flatten<
    Typed<ObjectType<T>> & ObjectPropsQuery<T['props'] & T['meta']>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectSchemaAny = ObjectSchema<any>;

export interface ObjectDescriptorConfig<T extends ObjectConfig = ObjectConfigDefault>
    extends SchemaDescriptorConfig,
        ValidableConfig<Strict<ObjectValue<T>>> {
    type: T['type'];
    kind: T['kind'];
    base?: ObjectDescriptor;
    props: T['props'];
    meta: T['meta'];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectDescriptorAny = ObjectDescriptor<any>;

interface ObjectPropPair<TProps extends ObjectProps> {
    key: keyof TProps;
    schema: TProps[keyof TProps];
}

export class ObjectDescriptor<T extends ObjectConfig = ObjectConfig> extends SchemaDescriptor {
    public declare readonly typename: IfAny<T['type'], string>;
    public readonly base: ObjectDescriptor | null;
    public readonly inheritance: readonly ObjectDescriptor[];
    public readonly kind: T['kind'];
    public readonly abstract: boolean;
    public readonly sealed: boolean;
    public readonly props: IfAny<T['props'], ObjectProps>;
    public readonly propsArray: readonly ObjectPropPair<T['props']>[];
    public readonly meta: IfAny<T['meta'], ObjectProps>;
    public readonly validators: readonly Validator<unknown>[];
    public readonly derived: ReadonlyMap<string, ObjectDescriptor> = new Map<
        string,
        ObjectDescriptor
    >();
    public readonly graphqlType: GraphQLObjectType | undefined;
    private readonly lazySerializer: LazySerializer | undefined;

    constructor(config: ObjectDescriptorConfig<T>) {
        super({
            type: config.type,
            name: config.name,
        });

        this.kind = config.kind;
        this.abstract = this.kind === 'abstract';
        this.sealed = this.kind === 'sealed';

        if (!this.sealed && config.base && config.base.sealed) {
            throw new SchemaError(
                `Base schema ${config.base.typename} is sealed and cannot be derived from.`,
            );
        }

        this.base = config.base || null;

        this.props = Object.assign({}, config.base?.props, config.props);

        const propsArray: ObjectPropPair<T['props']>[] = [];
        for (const prop in this.props) {
            propsArray.push({
                key: prop,
                schema: this.props[prop],
            });
        }
        this.propsArray = propsArray;

        this.meta = Object.assign({}, config.base?.meta, config.meta);

        this.inheritance = config.base ? [...config.base.inheritance, config.base] : [];
        this.validators = mergeValidators(
            config.base?.validators,
            config.validate,
        ) as Validator<unknown>[];

        if (DEBUG && !this.abstract && !Object.keys(this.props).length) {
            throw new SchemaError(`Object "${this.typename}" is is not defining any properties.`);
        }

        for (const base of this.inheritance) {
            (base.derived as Map<string, ObjectDescriptorAny>).set(this.typename, this as any);
        }

        if (GRAPHQL) {
            this.lazySerializer = createLazySerializer(this.typename, {
                ...this.props,
                ...this.meta,
            });
        }
    }

    public defaultValue(): ObjectValue<T> {
        if (this.abstract) {
            const result = this.derived.values().next();
            if (result.value) {
                return (result.value as ObjectDescriptor<T>).defaultValue();
            }

            throw new SchemaError('Abstract types do not have default values');
        }

        const value = makeTyped<ObjectValue<T>>(this.typename);
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = prop.defaultValue();
            value[key as keyof ObjectValue<T>] = propValue as ObjectValue<T>[keyof ObjectValue<T>];
        }

        return value;
    }

    public is(value: unknown): value is ObjectValue<T> {
        const type = getTypeName(value);
        if (!type) {
            return false;
        }

        return this.isTypeName(type);
    }

    public isTypeName(type: string): type is T['type'] {
        if (this.abstract) {
            return this.derived.has(type);
        }

        if (this.typename === type) {
            return true;
        }

        return this.sealed ? false : this.derived.has(type);
    }

    public isBaseOf(descriptor: ObjectDescriptorAny): boolean {
        return this.inheritance.includes(descriptor);
    }

    public isDirectBaseOf(descriptor: ObjectDescriptorAny): boolean {
        return descriptor.base === (this as unknown);
    }

    public create(value: ObjectPropsValue<T['props']>): ObjectValue<T> {
        return wrapWithType(value, this.typename);
    }

    public coerce(value: Partial<ObjectValue<T>>): ObjectValue<T> {
        if (this.abstract) {
            return this.coerceAbstract(value);
        }

        const result = makeTyped<ObjectValue<T>>(this.typename);
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = value[key];
            result[key as keyof ObjectValue<T>] = prop.coerce(
                propValue,
            ) as ObjectValue<T>[keyof ObjectValue<T>];
        }

        return result;
    }

    private coerceAbstract(value: Partial<ObjectValue<T>>) {
        const type = getTypeName(value);
        if (!type) {
            throw new SchemaError(`You need to provide typename to create an abstract type.`);
        }

        if (type === this.typename) {
            throw new SchemaError(
                `You can't create abstract type ${type} directly. ` +
                    `You need to create one of derived types.`,
            );
        }

        const schema = this.derived.get(type);
        if (!schema) {
            throw new SchemaError(`Type ${type} does not implement this interface.`);
        }

        return schema.coerce(value as any) as unknown as ObjectValue<T>;
    }

    public validate<TValue>(value: TValue, ctx: ValidationContext = {}) {
        // Check if proper type
        const type = getTypeName(value);
        if (!type) {
            return singleError({
                code: CommonErrors.WrongType,
            });
        }

        if (this.isPotentialyASubtype(type)) {
            // Validate as a subtype.
            const derived = this.derived.get(type);
            if (!derived) {
                return singleError({
                    code: CommonErrors.WrongType,
                });
            }

            return derived.validateCore(value as ObjectValue<T>, ctx);
        }

        if (type !== this.typename) {
            return singleError({
                code: CommonErrors.WrongType,
            });
        }

        return this.validateCore(value as ObjectValue<T>, ctx);
    }

    private validateCore(value: ObjectValue<T>, ctx: ValidationContext) {
        return (
            this.validateProps(value, ctx) ??
            // Run custom validation only if properties are valid
            validateWithMany(value, this.validators, ctx)
        );
    }

    private validateProps(value: ObjectValue<T>, ctx: ValidationContext) {
        let errors: ValidationErrorsMap | undefined;
        for (const key in this.props) {
            const prop = this.props[key];
            const propValue = value[key as keyof typeof value];
            const propErrors = prop.validate(propValue, ctx);

            if (propErrors) {
                (errors || (errors = {}))[key] = propErrors;
            }
        }

        // check unknown props
        if (!ctx.skipUnknown) {
            for (const prop of Object.keys(value)) {
                // already checked at the beginning of validation
                if (prop === '__typename') {
                    continue;
                }

                // is not unknown prop
                if (this.props[prop as keyof T['props']]) {
                    continue;
                }

                (errors || (errors = {}))[prop] = createError({
                    code: CommonErrors.UnknownProperty,
                });
            }
        }

        return errors;
    }

    public validateAndThrow(value: unknown, ctx: ValidationContext = {}): void {
        const validation = this.validate(value, ctx);
        if (validation) {
            throw new ValidationException(validation);
        }
    }

    public serialize(value: ObjectValue<T>, opts?: SchemaSerializeOptions<false>): unknown;
    public serialize(value: ObjectQuery<T>, opts?: SchemaSerializeOptions<true>): unknown;
    public serialize(
        value: ObjectValue<T> | ObjectQuery<T>,
        opts?: SchemaSerializeOptions,
    ): unknown;
    public serialize(
        value: ObjectValue<T> | ObjectQuery<T>,
        opts?: SchemaSerializeOptions,
    ): unknown {
        if (!value) {
            return null;
        }

        let type = getTypeName(value);
        if (type && this.isPotentialyASubtype(type)) {
            // Serialize as a subtype.
            const schema = this.assertDerivedType(type);
            return schema.serialize(value, opts);
        }

        if (!type && !this.abstract) {
            type = this.typename;
        }

        assertTypeName(type, this.typename);

        if (opts?.graphql && GRAPHQL) {
            return new this.lazySerializer!(value);
        }

        const result = makeTyped<TypedAny<T['type']>>(type);

        serializeProps(value, result, this.props, opts);
        if (opts?.graphql) {
            serializeProps(value, result, this.meta, opts);
        }

        return result;
    }

    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<false>,
    ): ObjectValue<T> | null;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<true>,
    ): ObjectQuery<T> | null;
    public deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions,
    ): ObjectValue<T> | ObjectQuery<T> | null;
    public deserialize(value: unknown, opts?: SchemaDeserializeOptions) {
        if (!value || typeof value !== 'object') {
            return null;
        }

        // Meta will be deserialized from the original value
        const meta = value;
        // Rest of the props may be deserialized from internal _json prop if present
        if ('_json' in value) {
            value = value['_json'] as object;
        }

        const type = getTypeName(value);
        if (type && this.isPotentialyASubtype(type)) {
            // Deserialize as a subtype.
            const schema = this.assertDerivedType(type);
            return schema.deserializeValue(
                value as Record<string, unknown>,
                meta as Record<string, unknown>,
                opts,
            ) as ObjectValue<T> | ObjectQuery<T> | null;
        }

        assertTypeName(type, this.typename);
        return this.deserializeValue(
            value as Record<string, unknown>,
            meta as Record<string, unknown>,
            opts,
        );
    }

    private deserializeValue(
        props: Record<string, unknown>,
        meta: Record<string, unknown>,
        opts?: SchemaDeserializeOptions,
    ) {
        const result = makeTyped<ObjectValue<T>>(this.typename);

        this.deserializeProps(props, result, this.props, opts);

        if (opts?.graphql) {
            this.deserializeProps(meta, result, this.meta, opts);
        }

        return result;
    }

    private deserializeProps(
        value: Record<string, unknown>,
        result: Record<string, unknown>,
        props: ObjectProps,
        opts?: SchemaDeserializeOptions,
    ) {
        const graphql = opts?.graphql;
        for (const key in props) {
            const prop = props[key];

            const propValue = value[key];
            if (graphql && propValue === undefined) {
                // When we deserialize GraphQL response we omit missing props.
                continue;
            }

            const deserialized = prop.deserialize(propValue, opts);
            if (deserialized === undefined) {
                continue;
            }

            result[key] = deserialized;
        }
    }

    public visitProps(value: Maybe<ObjectValue<T>>, visitor: SchemaVisitor): SchemaVisitorResult {
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

    public *getDirectlyDerivingTypes() {
        for (const type of this.derived.values()) {
            if ((type.base as unknown) === this) {
                yield type;
            }
        }
    }

    private assertDerivedType(type: Maybe<string>) {
        assertTypeName(type);
        const schema = this.derived.get(type);
        if (!schema) {
            throw new SchemaError(`Type ${type} is not deriving schema ${this.typename}`);
        }

        return schema;
    }

    private isPotentialyASubtype(type: string) {
        return this.abstract || (!this.sealed && type !== this.typename);
    }
}

export interface ObjectSchemaConfig extends ObjectConfig {
    nullable: boolean;
}

export interface ObjectSchemaConfigDefault extends ObjectConfigDefault {
    nullable: boolean;
}

interface ObjectSchemaParams<T extends ObjectSchemaConfig>
    extends NullableSchemaConfig<ObjectValue<T>, T['nullable']> {
    default?: () => Nullable<ObjectPropsValue<T['props']>, T['nullable']>;
}

export abstract class ObjectSchema<
    T extends ObjectSchemaConfig = ObjectSchemaConfigDefault,
> extends NullableSchema<ObjectValue<T>, T['nullable'], ObjectQuery<T>> {
    public declare abstract readonly descriptor: ObjectDescriptor<T>;

    constructor(config: ObjectSchemaParams<T>) {
        super(config);

        const defaultValue = config.default;
        if (defaultValue) {
            this.defaultValue = () => {
                const value = defaultValue() as NullableObject<T>;
                if (value) {
                    wrapWithType(value, this.typename);
                }

                return value;
            };
        }
    }

    public override get typename(): T['type'] {
        return this.descriptor.typename;
    }

    public get abstract() {
        return this.descriptor.abstract;
    }

    public get props() {
        return this.descriptor.props;
    }

    public get propsArray() {
        return this.descriptor.propsArray;
    }

    public get meta() {
        return this.descriptor.meta;
    }

    public defaultValue(): NullableObject<T> {
        if (this.nullable) {
            return null as NullableObject<T>;
        }

        return this.descriptor.defaultValue();
    }

    protected isNonNull(value: unknown): value is ObjectValue<T> {
        return this.descriptor.is(value);
    }

    public isTypeName(type: string): type is T['type'] {
        return this.descriptor.isTypeName(type);
    }

    protected override preValidate(value: unknown, ctx: ValidationContext) {
        return this.descriptor.validate(value, ctx);
    }

    public create(value: ObjectPropsValue<T['props']>): ObjectValue<T> {
        const obj = makeTyped<ObjectValue<T>>(this.typename);
        return Object.assign(obj, value);
    }

    protected coerceNonNull(value: Partial<ObjectValue<T>>): ObjectValue<T> | null {
        return this.descriptor.coerce(value);
    }

    public override serialize(value: ObjectValue<T>, opts?: SchemaSerializeOptions<false>): unknown;
    public override serialize(value: ObjectQuery<T>, opts?: SchemaSerializeOptions<true>): unknown;
    public serialize(
        value: ObjectValue<T> | ObjectQuery<T>,
        opts?: SchemaSerializeOptions,
    ): unknown {
        return this.descriptor.serialize(value, opts);
    }

    public override deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<false>,
    ): ObjectValue<T>;
    public override deserialize(
        value: unknown,
        opts?: SchemaDeserializeOptions<true>,
    ): ObjectQuery<T>;
    public deserialize(value: unknown, opts?: SchemaDeserializeOptions) {
        return this.descriptor.deserialize(value, opts) ?? this.defaultValue();
    }

    public override visit(
        value: Maybe<ObjectValue<T>>,
        visitor: SchemaVisitor,
    ): SchemaVisitorResult {
        if (super.visit(value, visitor)) {
            return true;
        }

        return this.descriptor.visitProps(value, visitor);
    }

    // TODO write a proper stringify
    public stringify(value: ObjectValue<T>): string {
        return JSON.stringify(value);
    }

    public inherits(schema: ObjectSchema<any>) {
        return this.descriptor.isBaseOf(schema.descriptor);
    }

    public fragment<F extends FragmentProps<T['props'] & T['meta']>>(
        props: FragmentInput<T['props'] & T['meta'], F>,
    ): FragmentFrom<T['props'], T['type'], T['meta'], F> {
        return createFragment(this.descriptor, props as F);
    }
}

export interface ObjectSchemaStatic<T extends ObjectConfig = ObjectConfig> {
    readonly name: string;
    readonly typename: T['type'];
    readonly props: T['props'];
    readonly meta: T['meta'];
    readonly kind: T['kind'];

    coerce(value: Partial<ObjectValue<T>>): ObjectValue<T>;
    create(value: ObjectPropsValue<T['props']>): ObjectValue<T>;
    is(value: unknown): value is ObjectValue<T>;

    fragment<F extends FragmentProps<T['props'] & T['meta']>>(
        props: FragmentInput<T['props'] & T['meta'], F>,
    ): FragmentFrom<T['props'], ObjectType<T>, T['meta'], F>;
}

export interface ObjectSchemaConstructor<T extends ObjectConfig = ObjectConfig>
    extends ObjectSchemaStatic<T> {
    readonly descriptor: ObjectDescriptor<T>;

    new <TNullable extends boolean = false>(
        config?: ObjectSchemaOptions<T['props'], T['type'], TNullable>,
    ): ObjectSchema<T & { nullable: TNullable }>;
}

export type ObjectSchemaConstructorAny = ObjectSchemaConstructor<any>;

export function isObjectSchemaDefinition(obj: unknown): obj is ObjectSchemaConstructor {
    return (
        typeof obj === 'function' &&
        (obj as ObjectSchemaConstructor).descriptor instanceof ObjectDescriptor
    );
}

type LazySerializer = ReturnType<typeof createLazySerializer>;
function createLazySerializer(type: string, props: ObjectProps) {
    const serializer = class Serializer {
        public readonly __serialized: Record<string, unknown> = {};

        constructor(public readonly __value: Record<string, unknown>) {}

        public get __typename() {
            return type;
        }

        public get _json() {
            const existing = this.__serialized['_json'];
            if (existing != null) {
                return existing;
            }

            const result = makeTyped(type);
            serializeProps(this.__value, result, props);
            this.__serialized['_json'] = result;
            return result;
        }

        [key: string]: unknown;
    };

    for (const key in props) {
        const prop = props[key];
        Object.defineProperty(serializer.prototype, key, {
            configurable: true,
            enumerable: true,
            get(this: InstanceType<typeof serializer>) {
                const existing = this.__serialized[key];
                if (existing != null) {
                    return existing;
                }

                const result = prop.serialize(this.__value[key], { graphql: true });
                this.__serialized[key] = result;
                return result;
            },
        });
    }

    return serializer;
}

function serializeProps(
    value: Record<string, unknown>,
    result: Record<string, unknown>,
    props: ObjectProps,
    opts?: SchemaSerializeOptions,
) {
    for (const key in props) {
        const prop = props[key];
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
}
