import { test, expect } from 'vitest';

import { coerce } from './coerce.js';
import { extend } from './extend.js';
import { number } from './schemas/number.js';

test('extend number to nullable', () => {
    const schema = number();

    const nullable = extend(schema, {
        nullable: true,
    });

    expect(coerce(nullable, null)).toBe(null);
});
