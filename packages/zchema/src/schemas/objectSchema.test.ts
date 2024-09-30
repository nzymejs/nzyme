import { test } from 'vitest';

import { numberSchema } from './numberSchema.js';
import { objectSchema } from './objectSchema.js';
import { stringSchema } from './stringSchema.js';

test('basic object schema', () => {
    const schema = objectSchema({
        props: {
            foo: numberSchema({}),
            bar: stringSchema(),
        },
    });

    const value = schema.coerce({});

    expect(value).toEqual({
        foo: 0,
        bar: '',
    });
});
