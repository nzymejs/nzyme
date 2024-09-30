import type { Schema, SchemaOptions, SchemaValue } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type ObjectSchemaProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Schema<any, object>;
};

export type ObjectSchemaPropsValue<TProps extends ObjectSchemaProps> = {
    [K in keyof TProps]: SchemaValue<TProps[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ObjectSchemaOptions<TProps extends ObjectSchemaProps = {}> = SchemaOptions<
    ObjectSchemaPropsValue<TProps>
> & {
    props: TProps;
};

export type ObjectSchema<O extends ObjectSchemaOptions> = Schema<
    ObjectSchemaPropsValue<O['props']>,
    O
>;

export type ObjectSchemaValue<O extends ObjectSchemaOptions> = ObjectSchemaPropsValue<O['props']>;

export function objectSchema<O extends ObjectSchemaOptions>(
    options: O & ObjectSchemaOptions<O['props']>,
): ObjectSchema<O> {
    const props: [name: string, schema: Schema][] = [];

    for (const propKey in options.props) {
        const propSchema = options.props[propKey as keyof O['props']] as Schema;
        props.push([propKey, propSchema]);
    }

    return createSchema({
        type: 'object',
        coerce,
        serialize,
        options,
    });

    function coerce(value: unknown) {
        const result: Record<string, unknown> = {};

        for (const [propKey, propSchema] of props) {
            const propValue = value[propKey as keyof O['props']];
            result[propKey] = propSchema.serialize(propValue);
        }

        return result as ObjectSchemaValue<O>;
    }

    function serialize(value: ObjectSchemaValue<O>) {
        const result: Record<string, unknown> = {};

        for (const [propKey, propSchema] of props) {
            const propValue = value[propKey as keyof O['props']];
            result[propKey] = propSchema.serialize(propValue);
        }

        return result;
    }
}
