import { expect, test, describe } from 'vitest';

import { numberSchema } from './number.js';

describe('default number schema', () => {
    test('parse number', () => {
        const schema = numberSchema();
        const value = schema.parse(42);

        expect(value).toBe(42);
    });

    test('parse valid string', () => {
        const schema = numberSchema();
        const value = schema.parse('42');

        expect(value).toBe(42);
    });

    test('parse invalid string', () => {
        const schema = numberSchema();
        const value = schema.parse('foo');

        expect(value).toBe(NaN);
    });

    test('parse null', () => {
        const schema = numberSchema();
        const value = schema.parse(null);

        expect(value).toBe(null);
    });

    test('parse undefined', () => {
        const schema = numberSchema();
        const value = schema.parse(undefined);

        expect(value).toBe(null);
    });

    test('parse boolean', () => {
        const schema = numberSchema();
        const value = schema.parse(true);

        expect(value).toBe(NaN);
    });

    test('serialize number', () => {
        const schema = numberSchema();
        const value = schema.serialize(42);

        expect(value).toBe(42);
    });
});

test('nullable number schema', () => {
    const schema = numberSchema({ nullable: true });
});

test('number schema with meta', () => {
    const schema = numberSchema({
        meta: {
            foo: 'bar',
        },
    });
});
