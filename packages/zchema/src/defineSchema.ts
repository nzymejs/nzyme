import type { FunctionParams } from '@nzyme/types';
import { identity } from '@nzyme/utils';

import {
    SCHEMA_PROTO,
    type Schema,
    type SchemaAny,
    type SchemaOptions,
    type SchemaProto,
    type SchemaValue,
} from './Schema.js';

type SchemaFactory = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]): Schema;
};

type SchemaFactoryValue<F extends SchemaFactory> = Exclude<
    SchemaValue<ReturnType<F>>,
    undefined | null
>;

type SchemaOptionsFactory<
    F extends SchemaFactory = SchemaFactory,
    O extends SchemaOptions<SchemaFactoryValue<F>> = SchemaOptions<SchemaFactoryValue<F>>,
> = (...args: FunctionParams<F>) => O;

type SchemaProtoFactory<
    F extends SchemaFactory = SchemaFactory,
    O extends SchemaOptions<SchemaFactoryValue<F>> = SchemaOptions<SchemaFactoryValue<F>>,
> = (options: O) => SchemaProto<SchemaFactoryValue<F>>;

type SchemaDefinition<
    F extends SchemaFactory = SchemaFactory,
    O extends SchemaOptions<SchemaFactoryValue<F>> = SchemaOptions<SchemaFactoryValue<F>>,
> = {
    options?: SchemaOptionsFactory<F, O>;
    proto: SchemaProtoFactory<F, O>;
};

export function defineSchema<
    F extends SchemaFactory,
    O extends SchemaOptions<SchemaFactoryValue<F>> = SchemaOptions<SchemaFactoryValue<F>>,
>(definition: SchemaDefinition<F, O>) {
    const optionsFactory = (definition.options ?? identity) as SchemaOptionsFactory<F, O>;
    const protoFactory = definition.proto;
    const schemaFactory: SchemaFactory = (...args) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const options = optionsFactory(...(args as FunctionParams<F>)) ?? ({} as O);

        const schema: SchemaAny = {
            ...options,
            nullable: options.nullable ?? false,
            optional: options.optional ?? false,
            validators: (options.validators ?? []) as SchemaAny['validators'],
            [SCHEMA_PROTO]: protoFactory(options) as SchemaAny[typeof SCHEMA_PROTO],
        };

        return schema;
    };

    return schemaFactory as F;
}
