import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { defineSchema } from '../defineSchema.js';

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

type VoidSchemaFactory = {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    <O extends SchemaOptions<void> = {}>(
        options?: O & SchemaOptions<void>,
    ): VoidSchema<SchemaOptionsSimlify<O>>;
};

export const voidSchema = defineSchema<VoidSchemaFactory>({
    proto: () => proto,
});
