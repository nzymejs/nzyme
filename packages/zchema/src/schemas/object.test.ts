import { expect, test } from 'vitest';

import { number } from './number.js';
import { object } from './object.js';
import { string } from './string.js';
import { coerce } from '../coerce.js';

test('basic object schema', () => {
    const schema = object({
        props: {
            number: number({}),
            numberNullable: number({ nullable: true }),
            numberOptional: number({ optional: true }),
            string: string(),
            stringNullable: string({ nullable: true }),
            stringOptional: string({ optional: true }),
        },
    });

    const value = coerce(schema, {});

    expect(value).toEqual({
        number: 0,
        numberNullable: null,
        numberOptional: undefined,
        string: '',
        stringNullable: null,
        stringOptional: undefined,
    });
});
