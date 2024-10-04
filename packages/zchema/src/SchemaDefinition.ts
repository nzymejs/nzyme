import { SCHEMA_FACTORY, type Schema, type SchemaOptions } from './Schema.js';

export type SchemaProto<V = unknown> = {
    coerce: (value: unknown) => V;
    serialize: (value: V) => unknown;
    check(value: unknown): value is V;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaFactory<V = any, O extends SchemaOptions<V> = any> = (options: O) => Schema<V, O>;

/*#__NO_SIDE_EFFECTS__*/
export function defineSchema<F extends SchemaFactory>(factory: F): F {
    const wrapper: SchemaFactory = options => {
        const schema = factory(options);
        schema[SCHEMA_FACTORY] = wrapper;

        return Object.freeze(schema);
    };

    return wrapper as F;
}
