import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions, SchemaOptionsSimlify, SchemaProto } from '../Schema.js';
import { defineSchema } from '../defineSchema.js';

export type BooleanSchema<O extends SchemaOptions<boolean>> = Schema<boolean, O>;

const proto: SchemaProto<boolean> = {
    coerce: Boolean,
    serialize: identity,
    check: value => typeof value === 'boolean',
    default: () => false,
};

type BooleanSchemaFactory = {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    <O extends SchemaOptions<boolean> = {}>(
        options?: O & SchemaOptions<boolean>,
    ): BooleanSchema<SchemaOptionsSimlify<O>>;
};

export const boolean = defineSchema<BooleanSchemaFactory>({
    proto: () => proto,
});
