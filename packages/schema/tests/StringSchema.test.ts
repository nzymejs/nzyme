import { StringSchema } from '@nzyme/schema';
import { expectValidation, errorWithCode } from '@lesscms/testing';
import { CommonErrors } from '@nzyme/validation';

test('by default allows empty', () => {
    const schema = new StringSchema();

    // valid
    expectValidation({
        schema: schema,
        value: 'foo',
        errors: null,
    });

    // valid
    expectValidation({
        schema: schema,
        value: '',
        errors: null,
    });
});

describe('default value', () => {
    test('empty string by default', () => {
        const schema = new StringSchema();

        expect(schema.defaultValue()).toBe('');
    });

    test('custom constant', () => {
        const schema = new StringSchema({
            default: 'xxx',
        });

        expect(schema.defaultValue()).toBe('xxx');
    });

    test('custom function', () => {
        const schema = new StringSchema({
            default: () => 'xxx',
        });

        expect(schema.defaultValue()).toBe('xxx');
    });
});

describe('validation', () => {
    test('allowing empty', () => {
        const schema = new StringSchema({
            nonEmpty: false,
        });

        // valid
        expectValidation({
            schema: schema,
            value: 'foo',
            errors: null,
        });

        // valid
        expectValidation({
            schema: schema,
            value: '',
            errors: null,
        });
    });

    test('not allowing empty', () => {
        const schema = new StringSchema({
            nonEmpty: true,
        });

        // valid
        expectValidation({
            schema: schema,
            value: 'foo',
            errors: null,
        });

        // invalid
        expectValidation({
            schema: schema,
            value: '',
            errors: [errorWithCode(CommonErrors.Required)],
        });
    });

    test('with custom validator', () => {
        const schema = new StringSchema({
            validate(value) {
                if (value === 'foo') {
                    return [errorWithCode('Bad')];
                }
            },
        });

        expectValidation({
            schema: schema,
            value: 'foo',
            errors: [errorWithCode('Bad')],
        });
    });
});
