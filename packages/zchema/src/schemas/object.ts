import type { Flatten } from '@nzyme/types';
import { isPlainObject } from '@nzyme/utils';

import type {
    Schema,
    SchemaAny,
    SchemaOptions,
    SchemaOptionsSimlify,
    SchemaProto,
    SchemaValue,
    SchemaVisitor,
} from '../Schema.js';
import { createSchema } from '../createSchema.js';
import { coerce } from '../utils/coerce.js';
import { serialize } from '../utils/serialize.js';

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

export type ObjectSchemaOptions<TProps extends ObjectSchemaProps = ObjectSchemaProps> =
    SchemaOptions<ObjectSchemaPropsValue<TProps>> & {
        props: TProps;
    };

type ObjectSchemaOptionsProps<O extends ObjectSchemaOptions> =
    O extends ObjectSchemaOptions<infer P extends ObjectSchemaProps> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectSchema<O extends ObjectSchemaOptions = ObjectSchemaOptions> = ForceName<
    O extends ObjectSchemaOptions<infer P extends ObjectSchemaProps>
        ? Schema<ObjectSchemaPropsValue<P>, O>
        : never
>;

export type ObjectSchemaAny = Schema<Record<string, unknown>> & {
    props: ObjectSchemaProps;
};

declare class FF {}
type ForceName<T> = T & FF;

export type ObjectSchemaValue<O extends ObjectSchemaOptions> = ObjectSchemaPropsValue<O['props']>;

export function object<O extends ObjectSchemaOptions>(
    options: O & ObjectSchemaOptions<ObjectSchemaOptionsProps<O>>,
) {
    const props: [name: string, schema: Schema][] = [];

    for (const propKey in options.props) {
        const propSchema = options.props[propKey];
        props.push([propKey, propSchema]);
    }

    const proto: SchemaProto<ObjectSchemaValue<O>> = {
        coerce: coerceValue,
        serialize: serializeValue,
        check: checkValue,
        default: defaultValue,
        visit: visitValue,
    };

    return createSchema<ObjectSchemaValue<O>>(
        proto,
        options as SchemaOptions<ObjectSchemaValue<O>>,
    ) as ObjectSchema<SchemaOptionsSimlify<O>>;

    function coerceValue(value: unknown) {
        const result: Record<string, unknown> = {};

        for (const [propKey, propSchema] of props) {
            const propValue = (value as Record<string, unknown>)[propKey];
            result[propKey] = coerce(propSchema, propValue);
        }

        return result as ObjectSchemaValue<O>;
    }

    function serializeValue(value: ObjectSchemaValue<O>) {
        const result: Record<string, unknown> = {};

        for (const [propKey, propSchema] of props) {
            const propValue = value[propKey as keyof ObjectSchemaValue<O>];
            result[propKey] = serialize(propSchema, propValue);
        }

        return result;
    }

    function checkValue(value: unknown): value is ObjectSchemaValue<O> {
        return isPlainObject(value);
    }

    function defaultValue() {
        return coerceValue({});
    }

    function visitValue(value: ObjectSchemaValue<O>, visitor: SchemaVisitor) {
        for (const [propKey, propSchema] of props) {
            const propValue = value[propKey as keyof ObjectSchemaValue<O>];
            visitor(propSchema, propValue, propKey);
        }
    }
}
