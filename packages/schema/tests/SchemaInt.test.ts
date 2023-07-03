import { IntSchema } from '@nzyme/schema';
import { expectValidation } from '@lesscms/testing';

describe('default value', () => {
    test('false by default', () => {
        const schema = new IntSchema();

        expect(schema.defaultValue()).toBe(0);
    });

    test('custom constant', () => {
        const schema = new IntSchema({
            default: 11,
        });

        expect(schema.defaultValue()).toBe(11);
    });

    test('custom function', () => {
        const schema = new IntSchema({
            default: () => 11,
        });

        expect(schema.defaultValue()).toBe(11);
    });
});

describe('validation', () => {
    test('with custom validator', () => {
        const schema = new IntSchema({
            validate(value) {
                if (value < 0) {
                    return [{ code: 'Negative' }];
                }
            },
        });

        expectValidation({
            schema: schema,
            value: -123,
            errors: [{ code: 'Negative' }],
        });
    });
});
