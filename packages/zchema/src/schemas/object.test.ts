import { expect, test } from 'vitest';

import { number } from './number.js';
import { object } from './object.js';
import { string } from './string.js';
import { coerce } from '../coerce.js';

test('basic object schema', () => {
    const schema = object({
        props: {
            foo: number({}),
            bar: string(),
        },
    });

    const value = coerce(schema, {});

    expect(value).toEqual({
        foo: 0,
        bar: '',
    });
});
