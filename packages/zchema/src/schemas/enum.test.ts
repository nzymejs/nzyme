import { expect, test, describe } from 'vitest';

import { enumSchema } from './enum.js';
import { coerce } from '../utils/coerce.js';
import { serialize } from '../utils/serialize.js';

describe('non-nullable enum schema', () => {
    const schema = enumSchema({
        values: ['foo', 'bar', 'baz'],
    });

    test('coerce number', () => {
        const value = coerce(schema, 42);
        expect(value).toBe('foo');
    });

    test('coerce valid string', () => {
        const value = coerce(schema, 'bar');
        expect(value).toBe('bar');
    });

    test('coerce invalid string', () => {
        const value = coerce(schema, 'rst');
        expect(value).toBe('foo');
    });

    test('coerce null', () => {
        const value = coerce(schema, null);
        expect(value).toBe('foo');
    });

    test('coerce undefined', () => {
        const value = coerce(schema, undefined);
        expect(value).toBe('foo');
    });

    test('coerce true', () => {
        const value = coerce(schema, true);
        expect(value).toBe('foo');
    });

    test('coerce false', () => {
        const value = coerce(schema, false);
        expect(value).toBe('foo');
    });

    test('serialize', () => {
        const value = serialize(schema, 'baz');
        expect(value).toBe('baz');
    });
});
