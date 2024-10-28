import type { FunctionParams } from '@nzyme/types';
import { identity } from '@nzyme/utils';

import {
    SCHEMA_BASE,
    SCHEMA_PROTO,
    type SchemaAny,
    type SchemaBase,
    type SchemaOptions,
    type SchemaProto,
    type SchemaValue,
} from './Schema.js';

type SchemaBaseValue<F extends SchemaBase> = Exclude<SchemaValue<ReturnType<F>>, undefined | null>;

type SchemaOptionsFactory<
    F extends SchemaBase = SchemaBase,
    O extends SchemaOptions<SchemaBaseValue<F>> = SchemaOptions<SchemaBaseValue<F>>,
> = (...args: FunctionParams<F>) => O;

type SchemaProtoFactory<
    F extends SchemaBase = SchemaBase,
    O extends SchemaOptions<SchemaBaseValue<F>> = SchemaOptions<SchemaBaseValue<F>>,
> = (options: O) => SchemaProto<SchemaBaseValue<F>>;

type SchemaDefinition<
    F extends SchemaBase = SchemaBase,
    O extends SchemaOptions<SchemaBaseValue<F>> = SchemaOptions<SchemaBaseValue<F>>,
> = {
    options?: SchemaOptionsFactory<F, O>;
    proto: SchemaProtoFactory<F, O>;
};

export function defineSchema<
    F extends SchemaBase,
    O extends SchemaOptions<SchemaBaseValue<F>> = SchemaOptions<SchemaBaseValue<F>>,
>(definition: SchemaDefinition<F, O>) {
    const optionsFactory = (definition.options ?? identity) as SchemaOptionsFactory<F, O>;
    const protoFactory = definition.proto;
    const SchemaBase: SchemaBase = (...args) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const options = optionsFactory(...(args as FunctionParams<F>)) ?? ({} as O);

        const schema: SchemaAny = {
            ...options,
            nullable: options.nullable ?? false,
            optional: options.optional ?? false,
            validators: (options.validators ?? []) as SchemaAny['validators'],
            [SCHEMA_BASE]: SchemaBase,
            [SCHEMA_PROTO]: protoFactory(options) as SchemaAny[typeof SCHEMA_PROTO],
        };

        return schema;
    };

    return SchemaBase as F;
}
