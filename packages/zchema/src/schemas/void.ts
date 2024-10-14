import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type VoidSchema<O extends SchemaOptions<void> = SchemaOptions<void>> = ForceName<
    Schema<void, O>
>;

declare class FF {}
type ForceName<T> = T & FF;

const proto: SchemaProto<void> = {
    coerce: () => undefined,
    serialize: () => undefined,
    check(value): value is void {
        return value === undefined;
    },
    default: () => undefined,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function voidSchema<O extends SchemaOptions<void> = {}>(options?: O & SchemaOptions<void>) {
    return createSchema<void>(proto, options) as VoidSchema<SchemaOptionsSimlify<O>>;
}
