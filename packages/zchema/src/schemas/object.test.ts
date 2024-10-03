import { expect, test } from 'vitest';

import { minValidator, regexValidator } from '@nzyme/validate';

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
        number: NaN,
        numberNullable: null,
        numberOptional: undefined,
        string: 'undefined',
        stringNullable: null,
        stringOptional: undefined,
    });
});

test('validate object schema', () => {
    const x = number({
        validators: [minValidator({ minValue: 10 })],
    });

    const schema = object({
        props: {
            number: number({
                nullable: true,
                validators: [minValidator({ minValue: 10 })],
            }),
            string: string({
                validators: [
                    regexValidator({
                        regex: /^[a-z]+$/,
                        message: () => 'must be lowercase letters',
                    }),
                ],
            }),
        },
    });
});
