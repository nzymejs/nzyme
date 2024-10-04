import { test, expect } from 'vitest';

import { coerce } from './coerce.js';
import { extend } from './extend.js';
import { number } from './schemas/number.js';
import { object } from './schemas/object.js';
import { string } from './schemas/string.js';

test('extend number to nullable', () => {
    const schema = number();

    const nullable = extend(schema, {
        nullable: true,
    });

    expect(coerce(nullable, null)).toBe(null);
});

test('extend object with props', () => {
    const schema = object({
        props: {
            number: number({}),
        },
    });

    const extended = extend(schema, {
        asdf: true,
        props: {
            ...schema.props,
            string: string(),
        },
    });

    const value = coerce(extended, {});

    expect(value).toEqual({
        number: NaN,
        string: 'undefined',
    });

    expect(extended.asdf).toBe(true);
});
