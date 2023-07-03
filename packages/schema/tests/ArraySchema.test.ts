import { StringSchema, ArraySchema, IntSchema, ObjectSchema } from '@nzyme/schema';
import { expectValidation } from '@lesscms/testing';
import { CommonErrors } from '@nzyme/validation';

describe('default value', () => {
    test('empty array by default', () => {
        const schema = new ArraySchema({
            item: new StringSchema(),
        });

        expect(schema.defaultValue()).toEqual([]);
    });

    test('custom constant', () => {
        const schema = new ArraySchema({
            item: new StringSchema(),
            default: ['asdf'],
        });

        expect(schema.defaultValue()).toEqual(['asdf']);
    });

    test('custom function', () => {
        const schema = new ArraySchema({
            item: new StringSchema(),
            default: () => ['asdf'],
        });

        expect(schema.defaultValue()).toEqual(['asdf']);
    });
});

test('array of polymorphic objects', () => {
    const BaseSchema = ObjectSchema.define({
        type: 'Base',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const ChildSchema1 = ObjectSchema.define({
        type: 'Bar',
        base: BaseSchema,
        props: {
            bar: new IntSchema(),
        },
    });

    const ChildSchema2 = ObjectSchema.define({
        type: 'Baz',
        base: BaseSchema,
        props: {
            baz: new IntSchema({
                validate(value) {
                    if (value < 0) {
                        return [{ code: 'Negative' }];
                    }
                },
            }),
        },
    });

    const OtherSchema = ObjectSchema.define({
        type: 'xxx',
        props: {
            foo: new StringSchema(),
        },
    });

    const arraySchema = new ArraySchema(new BaseSchema());

    // valid
    expectValidation({
        schema: arraySchema,
        value: [
            ChildSchema1.coerce({ foo: 'aa', bar: 123 }),
            ChildSchema2.coerce({ foo: 'bb', baz: 222 }),
            ChildSchema2.coerce({ foo: 'cc', baz: 11 }),
            ChildSchema1.coerce({ foo: 'aa', bar: 555 }),
        ],
        errors: null,
    });

    // type mismatch in one element
    expectValidation({
        schema: arraySchema,
        value: [
            ChildSchema1.coerce({ foo: 'aa', bar: 123 }),
            ChildSchema2.coerce({ foo: 'bb', baz: 222 }),
            OtherSchema.coerce({ foo: 'asdf' }),
            ChildSchema1.coerce({ foo: 'aa', bar: 555 }),
        ],
        errors: {
            2: {
                '': [{ code: CommonErrors.WrongType }],
            },
        },
    });

    // nested custom validation in one element
    expectValidation({
        schema: arraySchema,
        value: [
            ChildSchema1.coerce({ foo: 'aa', bar: 123 }),
            ChildSchema2.coerce({ foo: 'bb', baz: 222 }),
            ChildSchema2.coerce({ foo: 'asdf', baz: -123 }),
            ChildSchema1.coerce({ foo: 'aa', bar: 555 }),
        ],
        errors: {
            2: {
                baz: [{ code: 'Negative' }],
            },
        },
    });
});
