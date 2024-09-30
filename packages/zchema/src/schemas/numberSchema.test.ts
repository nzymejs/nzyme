import { expect, test, describe } from 'vitest';

import { numberSchema } from './numberSchema.js';

describe('default number schema', () => {
    const schema = numberSchema();

    test('coerce number', () => {
        const value = schema.coerce(42);

        expect(value).toBe(42);
    });

    test('coerce valid string', () => {
        const value = schema.coerce('42');

        expect(value).toBe(42);
    });

    test('coerce invalid string', () => {
        const value = schema.coerce('foo');

        expect(value).toBe(NaN);
    });

    test('coerce null', () => {
        const value = schema.coerce(null);

        expect(value).toBe(0);
    });

    test('coerce undefined', () => {
        const value = schema.coerce(undefined);

        expect(value).toBe(0);
    });

    test('coerce true', () => {
        const value = schema.coerce(true);

        expect(value).toBe(1);
    });

    test('coerce false', () => {
        const value = schema.coerce(false);

        expect(value).toBe(0);
    });

    test('serialize number', () => {
        const value = schema.serialize(42);

        expect(value).toBe(42);
    });
});

describe('nullable number schema', () => {
    const schema = numberSchema({ nullable: true });

    test('coerce number', () => {
        const value = schema.coerce(42);

        expect(value).toBe(42);
    });

    test('coerce valid string', () => {
        const value = schema.coerce('42');

        expect(value).toBe(42);
    });

    test('coerce invalid string', () => {
        const value = schema.coerce('foo');

        expect(value).toBe(NaN);
    });

    test('coerce null', () => {
        const value = schema.coerce(null);

        expect(value).toBe(null);
    });

    test('coerce undefined', () => {
        const value = schema.coerce(undefined);

        expect(value).toBe(null);
    });

    test('coerce true', () => {
        const value = schema.coerce(true);

        expect(value).toBe(1);
    });

    test('coerce false', () => {
        const value = schema.coerce(false);

        expect(value).toBe(0);
    });

    test('serialize number', () => {
        const value = schema.serialize(42);

        expect(value).toBe(42);
    });
});

test('number schema with meta', () => {
    const schema = numberSchema({
        default: 42,
        nullable: true,
        x: {
            asdf: 'asdf',
        },
    });
});
