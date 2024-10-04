import type { Flatten } from '@nzyme/types';

import type {
    Schema,
    SchemaAny,
    SchemaOptions,
    SchemaOptionsSimlify,
    SchemaValue,
} from '../Schema.js';
import { defineSchema, type SchemaProto } from '../SchemaDefinition.js';
import { coerce } from '../coerce.js';
import { createSchema } from '../createSchema.js';
import { serialize } from '../serialize.js';

export type ObjectSchemaProps = {
    [key: string]: SchemaAny;
};

export type ObjectSchemaPropsValue<TProps extends ObjectSchemaProps> = Flatten<
    {
        [K in keyof TProps as TProps[K]['optional'] extends false ? K : never]: SchemaValue<
            TProps[K]
        >;
    } & {
        [K in keyof TProps as TProps[K]['optional'] extends false ? never : K]+?: SchemaValue<
            TProps[K]
        >;
    }
>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ObjectSchemaOptions<TProps extends ObjectSchemaProps = ObjectSchemaProps> =
    SchemaOptions<ObjectSchemaPropsValue<TProps>> & {
        props: TProps;
    };

type ObjectSchemaOptionsProps<O extends ObjectSchemaOptions> =
    O extends ObjectSchemaOptions<infer P extends ObjectSchemaProps> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectSchema<O extends ObjectSchemaOptions> = ForceName<
    O extends ObjectSchemaOptions<infer P extends ObjectSchemaProps>
        ? Schema<ObjectSchemaPropsValue<P>, O>
        : never
>;

declare class FF {}
type ForceName<T> = T & FF;

export type ObjectSchemaValue<O extends ObjectSchemaOptions> = ObjectSchemaPropsValue<O['props']>;

export const object = defineSchema(
    <O extends ObjectSchemaOptions>(
        options: O & ObjectSchemaOptions<ObjectSchemaOptionsProps<O>>,
    ) => {
        const props: [name: string, schema: Schema][] = [];

        for (const propKey in options.props) {
            const propSchema = options.props[propKey];
            props.push([propKey, propSchema]);
        }

        const proto: SchemaProto<ObjectSchemaValue<O>> = {
            coerce(value) {
                const result: Record<string, unknown> = {};

                for (const [propKey, propSchema] of props) {
                    const propValue = (value as Record<string, unknown>)[propKey];
                    result[propKey] = coerce(propSchema, propValue);
                }

                return result as ObjectSchemaValue<O>;
            },
            serialize(value) {
                const result: Record<string, unknown> = {};

                for (const [propKey, propSchema] of props) {
                    const propValue = value[propKey as keyof ObjectSchemaValue<O>];
                    result[propKey] = serialize(propSchema, propValue);
                }

                return result;
            },
            check(value): value is ObjectSchemaValue<O> {
                return value != null && Object.getPrototypeOf(value) === Object.prototype;
            },
        };

        return createSchema<ObjectSchemaValue<O>>(
            proto,
            options as SchemaOptions<ObjectSchemaValue<O>>,
        ) as ObjectSchema<SchemaOptionsSimlify<O>>;
    },
);
