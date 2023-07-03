import { ObjectSchema, StringSchema, IntSchema } from '@nzyme/schema';
import { expectValidation } from '@lesscms/testing';

test('validate inherited class by abstract base type', () => {
    const BaseSchema = ObjectSchema.define({
        type: 'Base',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const ChildSchema = ObjectSchema.define({
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

    // valid
    expectValidation({
        schema: new BaseSchema(),
        value: ChildSchema.coerce({
            foo: 'bb',
            baz: 222,
        }),
        errors: null,
    });

    // nested custom validation
    expectValidation({
        schema: new BaseSchema(),
        value: ChildSchema.coerce({
            foo: 'asdf',
            baz: -123,
        }),
        errors: {
            baz: [{ code: 'Negative' }],
        },
    });
});

test('validate inherited class by open base type', () => {
    const BaseSchema = ObjectSchema.define({
        type: 'Base',
        sealed: false,
        props: {
            foo: new StringSchema(),
        },
    });

    const ChildSchema = ObjectSchema.define({
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

    // valid
    expectValidation({
        schema: new BaseSchema(),
        value: ChildSchema.coerce({
            foo: 'bb',
            baz: 222,
        }),
        errors: null,
    });

    // nested custom validation
    expectValidation({
        schema: new BaseSchema(),
        value: ChildSchema.coerce({
            foo: 'asdf',
            baz: -123,
        }),
        errors: {
            baz: [{ code: 'Negative' }],
        },
    });
});
