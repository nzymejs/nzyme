import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions } from '../Schema.js';
import { createSchema } from '../createSchema.js';
import { defineSchema } from '../defineSchema.js';

export type NumberSchema<O extends SchemaOptions<number>> = Schema<number, O>;

const proto = defineSchema<number>({
    coerce(value) {
        if (value == null) {
            return 0;
        }

        return Number(value);
    },
    serialize: identity,
});

// eslint-disable-next-line @typescript-eslint/ban-types
export function number<O extends SchemaOptions<number> = {}>(
    options?: O & SchemaOptions<number>,
): NumberSchema<O> {
    return createSchema(proto, options);
}
