import { SomeObject, Flatten, Writable } from '@nzyme/types';

import { createFragment } from '../Fragment.js';
import { SchemaOptions } from '../Schema.js';

import { ObjectConfig, ObjectConfigDefault, ObjectKind } from './ObjectConfig.js';
import { ObjectProps, ObjectPropsValueTyped } from './ObjectProps.js';
import {
    ObjectDescriptor,
    ObjectDescriptorAny,
    ObjectSchema,
    ObjectSchemaConstructor,
    ObjectSchemaConstructorAny,
    ObjectSchemaOptions,
} from './ObjectSchema.js';

export interface DefineObjectOptions<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TBase extends ObjectConfig,
> extends SchemaOptions<ObjectPropsValueTyped<TProps & TBase['props'], TType>> {
    type: TType;
    abstract?: boolean;
    sealed?: boolean;
    base?: ObjectSchemaConstructor<TBase>;
    props: TProps;
    meta?: TMeta;
}

export interface DefineSealedObjectOptions {
    abstract?: false | undefined;
    sealed?: true | undefined;
}

export interface DefineOpenObjectOptions {
    abstract?: false | undefined;
    sealed?: false;
}

export interface DefineAbstractObjectOptions {
    abstract: true;
    sealed?: false | undefined;
}

/**
 * Defines new object schema.
 */
export function defineObjectSchema<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps = SomeObject,
    TBase extends ObjectConfig = ObjectConfigDefault,
>(
    config: DefineObjectOptions<TProps, TType, TMeta, TBase> & DefineSealedObjectOptions,
): ObjectSchemaConstructor<{
    props: Flatten<TBase['props'] & TProps>;
    type: TType;
    meta: Flatten<TBase['meta'] & TMeta>;
    kind: 'sealed';
}>;
export function defineObjectSchema<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps = SomeObject,
    TBase extends ObjectConfig = ObjectConfigDefault,
>(
    config: DefineObjectOptions<TProps, TType, TMeta, TBase> & DefineOpenObjectOptions,
): ObjectSchemaConstructor<{
    props: Flatten<TBase['props'] & TProps>;
    type: TType;
    meta: Flatten<TBase['meta'] & TMeta>;
    kind: 'open';
}>;
export function defineObjectSchema<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps = SomeObject,
    TBase extends ObjectConfig = ObjectConfigDefault,
>(
    config: DefineObjectOptions<TProps, TType, TMeta, TBase> & DefineAbstractObjectOptions,
): ObjectSchemaConstructor<{
    props: Flatten<TBase['props'] & TProps>;
    type: TType;
    meta: Flatten<TBase['meta'] & TMeta>;
    kind: 'abstract';
}>;
export function defineObjectSchema<
    TProps extends ObjectProps,
    TMeta extends ObjectProps,
    TBase extends ObjectConfig,
>(config: DefineObjectOptions<TProps, string, TMeta, TBase>): ObjectSchemaConstructorAny {
    const base = config.base as unknown as ObjectSchemaConstructor | undefined;

    const descriptor = new ObjectDescriptor({
        type: config.type,
        kind: getObjectKind(config),
        base: base?.descriptor,
        props: config.props,
        meta: config.meta ?? {},
        name: config.name,
        validate: config.validate as any,
    });

    return defineObjectConstructor(
        base ?? (ObjectSchema as unknown as ObjectSchemaConstructor),
        descriptor,
    );
}

export function defineObjectConstructor(
    base: ObjectSchemaConstructor,
    descriptor: ObjectDescriptorAny,
) {
    const constructor = class extends base {
        public readonly descriptor = descriptor;

        constructor(opts: ObjectSchemaOptions = {}) {
            super({
                name: opts.name || descriptor.name,
                default: opts.default,
                validate: opts.validate,
                // This is just because schema constructor type is assuming,
                // that its not nullable by default
                nullable: opts.nullable as false | undefined,
            });
        }
    } as Writable<ObjectSchemaConstructor>;

    constructor.typename = descriptor.typename;
    constructor.kind = descriptor.kind;
    constructor.descriptor = descriptor;
    constructor.props = descriptor.props;
    constructor.meta = descriptor.meta;
    constructor.coerce = descriptor.coerce.bind(descriptor);
    constructor.create = descriptor.create.bind(descriptor);
    constructor.is = descriptor.is.bind(descriptor);
    constructor.fragment = props => createFragment(descriptor, props);

    return constructor as ObjectSchemaConstructor;
}

export function getObjectKind<
    TProps extends ObjectProps,
    TType extends string,
    TMeta extends ObjectProps,
    TBase extends ObjectConfig,
>(config: DefineObjectOptions<TProps, TType, TMeta, TBase>): ObjectKind {
    if (config.abstract) {
        return 'abstract';
    } else if (config.sealed === false) {
        return 'open';
    } else {
        return 'sealed';
    }
}
