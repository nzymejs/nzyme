import type { EmptyObject } from '@nzyme/types';
import { identity } from '@nzyme/utils';

import { type SchemaOptions, createSchema } from '../Schema.js';

export function numberSchema<TNullable extends boolean = false, TMeta extends object = EmptyObject>(
    options?: SchemaOptions<number, TNullable, TMeta>,
) {
    return createSchema({
        type: 'number',
        parse: parseNumber,
        serialize: identity,
        options,
    });
}

function parseNumber(value: unknown) {
    if (value == null) {
        return null;
    }

    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        return Number(value);
    }

    return NaN;
}
