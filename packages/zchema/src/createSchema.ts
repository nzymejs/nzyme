import type { Schema, SchemaOptions } from './Schema.js';

export type CreateSchemaParams<V, T extends string, O extends SchemaOptions<V>> = {
    type: T;
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
    options: (O & SchemaOptions<V>) | undefined;
};

export function createSchema<V, const T extends string, O extends SchemaOptions<V>>(
    params: CreateSchemaParams<V, T, O>,
) {
    const options: SchemaOptions<V> = params.options ?? {};
    const nullable = options.nullable ?? false;

    const schema: Schema = {
        type: params.type,
        nullable,
        coerce: params.coerce as Schema['coerce'],
        serialize: params.serialize as Schema['serialize'],
        default: options.default as Schema['default'],
    };

    if (params.options) {
        Object.assign(schema, options);
    }

    return schema as Schema<V, O, T>;
}

function wrapDefault<V, O extends SchemaOptions<V>>(options: O & SchemaOptions<V>) {
    const def = options.default;

    type Value = O['nullable'] extends true ? V | null : V;
    type Getter = () => Value;

    if (def === undefined) {
        if (options.nullable) {
            return (() => null) as Getter;
        }

        return null;
    }

    if (typeof def === 'function') {
        return def as Getter;
    }

    return (() => def) as Getter;
}

function wrapCoerce<V>(
    nullable: boolean,
    coerce: (value: unknown) => V,
    defaultValue: null | (() => V | null),
) {
    if (!nullable && !defaultValue) {
        return coerce;
    }

    if (nullable && defaultValue) {
        return (value: unknown) => {
            if (value === undefined) {
                return defaultValue();
            }

            if (value === null) {
                return null;
            }

            return coerce(value);
        };
    }

    if (nullable) {
        return (value: unknown) => {
            if (value == null) {
                return null;
            }

            return coerce(value);
        };
    }

    return (value: unknown) => {
        if (value == null) {
            return defaultValue!();
        }

        return coerce(value);
    };
}
