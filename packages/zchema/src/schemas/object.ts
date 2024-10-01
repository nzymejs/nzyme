import type { Flatten, Simplify } from '@nzyme/types';

import type { Schema, SchemaAny, SchemaOptions, SchemaValue } from '../Schema.js';
import { coerce } from '../coerce.js';
import { createSchema } from '../createSchema.js';
import { defineSchema } from '../defineSchema.js';
import { serialize } from '../serialize.js';

export type ObjectSchemaProps = {
    [key: string]: SchemaAny;
};

export type ObjectSchemaPropsValue<TProps extends ObjectSchemaProps> = {
    [K in keyof TProps]: SchemaValue<TProps[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ObjectSchemaOptions<TProps extends ObjectSchemaProps = ObjectSchemaProps> =
    SchemaOptions<ObjectSchemaPropsValue<TProps>> & {
        props: TProps;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectSchema<O extends ObjectSchemaOptions> = Schema<
    ObjectSchemaPropsValue<O['props']>,
    O
>;

export type ObjectSchemaValue<O extends ObjectSchemaOptions> = ObjectSchemaPropsValue<O['props']>;

const proto = defineSchema((options: ObjectSchemaOptions) => {
    const props: [name: string, schema: Schema][] = [];

    for (const propKey in options.props) {
        const propSchema = options.props[propKey];
        props.push([propKey, propSchema]);
    }

    return {
        coerce(value: unknown) {
            const result: Record<string, unknown> = {};

            for (const [propKey, propSchema] of props) {
                const propValue = (value as Record<string, unknown>)[propKey];
                result[propKey] = coerce(propSchema, propValue);
            }

            return result;
        },
        serialize(value: Record<string, unknown>) {
            const result: Record<string, unknown> = {};

            for (const [propKey, propSchema] of props) {
                const propValue = value[propKey];
                result[propKey] = serialize(propSchema, propValue);
            }

            return result;
        },
    };
});

export function object<O extends ObjectSchemaOptions>(
    options: O & ObjectSchemaOptions<O['props']>,
) {
    return createSchema(proto, options) as ObjectSchema<O>;
}
