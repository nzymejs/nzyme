import { errorWithCode, expectValidation } from '@lesscms/testing';

import { EnumSchema } from '@nzyme/schema';
import { CommonErrors } from '@nzyme/validation';

const Fruit = EnumSchema.define({
    type: 'Fruit',
    values: {
        apple: {
            name: 'Apple',
        },
        banana: {
            name: 'Banana',
        },
        raspberry: {
            name: 'Raspberry',
        },
    },
});

test('type guard', () => {
    const schema = new Fruit();

    expect(schema.is('apple')).toBe(true);
    expect(schema.is('banana')).toBe(true);
    expect(schema.is('raspberry')).toBe(true);
    expect(schema.is('tomato')).toBe(false);
});

test('validation - valid', () => {
    expectValidation({
        schema: new Fruit(),
        value: 'apple',
        errors: null,
    });

    expectValidation({
        schema: new Fruit(),
        value: 'banana',
        errors: null,
    });

    expectValidation({
        schema: new Fruit(),
        value: 'raspberry',
        errors: null,
    });
});

test('validation - null value', () => {
    // invalid
    expectValidation({
        schema: new Fruit(),
        value: null,
        errors: [errorWithCode(CommonErrors.Required)],
    });
});

test('validation - undefined value', () => {
    expectValidation({
        schema: new Fruit(),
        value: undefined,
        errors: [errorWithCode(CommonErrors.Required)],
    });
});

test('validation - invalid value', () => {
    expectValidation({
        schema: new Fruit(),
        value: 'tomato',
        errors: [{ code: CommonErrors.InvalidValue }],
    });
});

test('validation - invalid type', () => {
    expectValidation({
        schema: new Fruit(),
        value: 123,
        errors: [{ code: CommonErrors.InvalidValue }],
    });
});

test('default value - first by default', () => {
    expect(new Fruit().defaultValue()).toBe('apple');
});

test('default value - custom constant', () => {
    const Fruit = EnumSchema.define({
        type: 'Fruit',
        values: {
            apple: {
                name: 'Apple',
            },
            banana: {
                name: 'Banana',
            },
            raspberry: {
                name: 'Raspberry',
            },
        },
        default: 'banana',
    });

    expect(new Fruit().defaultValue()).toBe('banana');
});

test('default value - custom function', () => {
    const Fruit = EnumSchema.define({
        type: 'Fruit',
        values: {
            apple: {
                name: 'Apple',
            },
            banana: {
                name: 'Banana',
            },
            raspberry: {
                name: 'Raspberry',
            },
        },
    });

    const schema = new Fruit({
        default: () => 'banana',
    });

    expect(schema.defaultValue()).toBe('banana');
});
