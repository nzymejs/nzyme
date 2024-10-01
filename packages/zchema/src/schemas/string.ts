import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions } from '../Schema.js';
import { createSchema } from '../createSchema.js';
import { defineSchema } from '../defineSchema.js';

export type StringSchema<O extends SchemaOptions<string>> = Schema<string, O>;

const proto = defineSchema<string>({
    coerce(value) {
        if (value == null) {
            return '';
        }

        return String(value);
    },
    serialize: identity,
});

// eslint-disable-next-line @typescript-eslint/ban-types
export function string<O extends SchemaOptions<string> = {}>(
    options?: O & SchemaOptions<string>,
): StringSchema<O> {
    return createSchema(proto, options);
}
