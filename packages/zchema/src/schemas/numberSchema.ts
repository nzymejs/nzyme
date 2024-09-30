import { identity } from '@nzyme/utils';

import type { Schema, SchemaOptions } from '../Schema.js';
import { createSchema } from '../createSchema.js';

export type NumberSchema<O extends SchemaOptions<number>> = Schema<number, O, 'number'>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function numberSchema<O extends SchemaOptions<number> = {}>(
    options?: O & SchemaOptions<number>,
): NumberSchema<O> {
    return createSchema({
        type: 'number',
        coerce: coerceNumber,
        serialize: identity,
        options,
    });
}

function coerceNumber(value: unknown): number {
    if (value == null) {
        return 0;
    }

    return Number(value);
}
