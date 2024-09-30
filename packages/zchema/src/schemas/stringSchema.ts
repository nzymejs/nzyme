import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type StringSchema<O extends SchemaOptions<string>> = Schema<string, O>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function stringSchema<O extends SchemaOptions<string> = {}>(
    options?: O & SchemaOptions<string>,
): StringSchema<O> {
    return createSchema({
        type: 'string',
        coerce: coerceString,
        serialize: identity,
        options,
    });
}

function coerceString(value: unknown) {
    if (value == null) {
        return '';
    }

    return String(value);
}
