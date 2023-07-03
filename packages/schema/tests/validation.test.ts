import {
    SchemaValue,
    ObjectSchema,
    ArraySchema,
    BooleanSchema,
    IntSchema,
    StringSchema,
} from '@nzyme/schema';
import { errorWithCode, expectValidation } from '@lesscms/testing';
import { CommonErrors } from '@nzyme/validation';

test('basic object', () => {
    const FooSchema = ObjectSchema.define({
        type: 'Foo',
        props: {
            foo: new StringSchema({ nonEmpty: true }),
        },
    });

    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: 'asdf',
        },
        errors: null,
    });

    // undefined prop
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: undefined,
        },
        errors: {
            foo: [errorWithCode(CommonErrors.Required)],
        },
    });

    // missing prop
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
        },
        errors: {
            foo: [errorWithCode(CommonErrors.Required)],
        },
    });

    // empty string
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: '',
        },
        errors: {
            foo: [errorWithCode(CommonErrors.Required)],
        },
    });

    // null prop
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: null,
        },
        errors: {
            foo: [errorWithCode(CommonErrors.Required)],
        },
    });

    // wrong type
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: 123,
        },
        errors: {
            foo: [errorWithCode(CommonErrors.WrongType)],
        },
    });

    // unknown property
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            foo: 'asdf',
            xxx: 'asdf',
        },
        errors: {
            xxx: [errorWithCode(CommonErrors.UnknownProperty)],
        },
    });

    // wrong type
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Xxx',
            foo: 'xxx',
        },
        errors: {
            '': [errorWithCode(CommonErrors.WrongType)],
        },
    });

    // unnecessary type and null prop
    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Xxx',
            foo: null,
        },
        errors: {
            '': [errorWithCode(CommonErrors.WrongType)],
            // if type is wrong, no further validations are made
        },
    });
});

test('multiple properties - wrong type', () => {
    const ObjSchema = ObjectSchema.define({
        type: 'Obj',
        props: {
            foo: new StringSchema(),
        },
    });

    const FooSchema = ObjectSchema.define({
        type: 'Foo',
        props: {
            str: new StringSchema(),
            strNullable: new StringSchema({
                nullable: true,
            }),
            strControl: new StringSchema(),
            num: new IntSchema(),
            numNullable: new IntSchema({
                nullable: true,
            }),

            numControl: new IntSchema(),
            bool: new BooleanSchema(),
            boolNullable: new BooleanSchema({
                nullable: true,
            }),
            boolControl: new BooleanSchema(),
            array: new ArraySchema(new StringSchema()),
            object: new ObjSchema(),
            objectNullable: new ObjSchema({
                nullable: true,
            }),
            objectControl: new ObjSchema(),
        },
    });

    const obj: SchemaValue<typeof FooSchema> = FooSchema.create({
        str: 123 as any,
        strNullable: [] as any,
        strControl: 'asdf',
        num: 'asd' as any,
        numNullable: {} as any,
        numControl: 123,
        bool: 'xxx' as any,
        boolNullable: [] as any,
        boolControl: false,
        array: 'asdf' as any,
        object: 123 as any,
        objectNullable: [] as any,
        objectControl: ObjSchema.coerce({ foo: 'asd' }),
    });

    expectValidation({
        schema: new FooSchema(),
        value: obj,
        errors: {
            str: [errorWithCode(CommonErrors.WrongType)],
            strNullable: [errorWithCode(CommonErrors.WrongType)],
            num: [errorWithCode(CommonErrors.WrongType)],
            numNullable: [errorWithCode(CommonErrors.WrongType)],
            bool: [errorWithCode(CommonErrors.WrongType)],
            boolNullable: [errorWithCode(CommonErrors.WrongType)],
            array: {
                '': [errorWithCode(CommonErrors.WrongType)],
            },
            object: {
                '': [errorWithCode(CommonErrors.WrongType)],
            },
            objectNullable: {
                '': [errorWithCode(CommonErrors.WrongType)],
            },
        },
    });
});

test('object custom validation', () => {
    const ObjSchema = ObjectSchema.define({
        type: 'Obj',
        props: {
            foo: new StringSchema(),
            bar: new StringSchema({
                nullable: true,
            }),
            baz: new IntSchema(),
        },
        validate(value) {
            if (value.foo !== 'xxx') {
                return {
                    foo: [{ code: 'BadProp' }],
                };
            }
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            foo: 'xxx',
            bar: null,
            baz: 123,
        },
        errors: null,
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            foo: 'asdf',
            bar: null,
            baz: 123,
        },
        errors: {
            foo: [{ code: 'BadProp' }],
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            foo: 'xxx',
            bar: 'asdf',
            baz: null as any,
        },
        errors: {
            baz: [errorWithCode(CommonErrors.Required)],
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            foo: 'bbb',
            bar: 'asdf',
            baz: null as any,
        },
        errors: {
            // will not run custom validation if any property is invalid
            baz: [errorWithCode(CommonErrors.Required)],
        },
    });
});

test('typed object', () => {
    const ObjSchema = ObjectSchema.define({
        type: 'Foo',
        props: {
            foo: new StringSchema(),
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Foo',
            foo: 'xxx',
        },
        errors: null,
    });

    // no type
    expectValidation({
        schema: new ObjSchema(),
        value: {
            foo: 'asdf',
        },
        errors: {
            '': [errorWithCode(CommonErrors.WrongType)],
        },
    });

    // wrong type
    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Bar',
            foo: 'xxx',
        },
        errors: {
            '': [errorWithCode(CommonErrors.WrongType)],
        },
    });

    // wrong type and null prop
    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Bar',
            foo: null,
        },
        errors: {
            '': [errorWithCode(CommonErrors.WrongType)],
            // if type is wrong, no further validations are made
        },
    });
});

test('scalar custom validation', () => {
    const EmailSchema = new StringSchema({
        validate(value) {
            if (!value.includes('@')) {
                return [{ code: 'InvalidEmail' }];
            }
        },
    });

    const ObjSchema = ObjectSchema.define({
        type: 'Obj',
        props: {
            email: EmailSchema,
            bar: new StringSchema({
                nullable: true,
            }),
            baz: new IntSchema(),
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            email: 'asdf@gmail.com',
            bar: null,
            baz: 123,
        },
        errors: null,
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            email: 'asdf',
            bar: null,
            baz: 123,
        },
        errors: {
            email: [{ code: 'InvalidEmail' }],
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            email: 'asdf@gmail.com',
            bar: 'asdf',
            baz: null as any,
        },
        errors: {
            baz: [errorWithCode(CommonErrors.Required)],
        },
    });

    expectValidation({
        schema: new ObjSchema(),
        value: {
            __typename: 'Obj',
            // missing email prop
            bar: 'asdf',
            baz: null as any,
        },
        errors: {
            // will not run custom validation if any property is invalid
            email: [errorWithCode(CommonErrors.Required)],
            baz: [errorWithCode(CommonErrors.Required)],
        },
    });
});

test('nested object', () => {
    const ObjSchema = ObjectSchema.define({
        type: 'Obj',
        props: {
            foo: new StringSchema(),
            bar: new StringSchema({
                nullable: true,
            }),
            baz: new IntSchema(),
        },
    });

    const FooSchema = ObjectSchema.define({
        type: 'Foo',
        props: {
            str: new StringSchema(),
            object: new ObjSchema(),
        },
    });

    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            str: 'asd',
            object: {
                __typename: 'Obj',
                foo: 'asdf',
                bar: null,
                baz: 12,
            },
        },
        errors: null,
    });

    expectValidation({
        schema: new FooSchema(),
        value: {
            __typename: 'Foo',
            str: 'asd',
            object: {
                __typename: 'Obj',
                foo: null as any,
                bar: null,
                baz: 'asd' as any,
            },
        },
        errors: {
            object: {
                foo: [errorWithCode(CommonErrors.Required)],
                baz: [errorWithCode(CommonErrors.WrongType)],
            },
        },
    });
});

test('arrays of strings', () => {
    const arraySchema = new ArraySchema({
        item: new StringSchema({
            validate(value) {
                if (value === 'foo') {
                    return [{ code: 'Bad' }];
                }
            },
        }),
    });

    // valid
    expectValidation({
        schema: arraySchema,
        value: ['asdf', 'aaaa'],
        errors: null,
    });

    // null value
    expectValidation({
        schema: arraySchema,
        value: ['asdf', null, 'xxx'],
        errors: {
            1: [errorWithCode(CommonErrors.Required)],
        },
    });

    // wrong value
    expectValidation({
        schema: arraySchema,
        value: ['asdf', null, 'foo'],
        errors: {
            1: [errorWithCode(CommonErrors.Required)],
            2: [{ code: 'Bad' }],
        },
    });
});

test('nested array', () => {
    const ObjSchema = ObjectSchema.define({
        type: 'Obj',
        props: {
            foo: new StringSchema(),
        },
    });

    const arraySchema = new ArraySchema({
        item: new ObjSchema(),
        validate(arr) {
            if (!arr.length) {
                return {
                    '': [{ code: 'ArrayEmpty' }],
                };
            }

            if (arr[0].foo === 'bad') {
                return {
                    0: {
                        foo: [{ code: 'Bad' }],
                    },
                };
            }
        },
    });

    // valid
    expectValidation({
        schema: arraySchema,
        value: [
            {
                __typename: 'Obj',
                foo: 'asdf',
            },
            {
                __typename: 'Obj',
                foo: 'xxx',
            },
        ],
        errors: null,
    });

    // invalid
    expectValidation({
        schema: arraySchema,
        value: [
            {
                __typename: 'Obj',
                foo: 'asdf',
            },
            // null prop
            {
                __typename: 'Obj',
                foo: null,
            },
            // wrong prop
            {
                __typename: 'Obj',
                foo: 123,
            },
            {
                __typename: 'Obj',
                foo: 'asdf',
            },
            // missing prop
            {
                __typename: 'Obj',
            },
            // will not run this validation if any item is invalid
            {
                __typename: 'Obj',
                foo: 'bad',
            },
            // missing type
            {
                foo: 'asdf',
            },
            // wrong type
            {
                __typename: 'Xxx',
                foo: 'asdf',
            },
        ],
        errors: {
            1: {
                foo: [errorWithCode(CommonErrors.Required)],
            },
            2: {
                foo: [errorWithCode(CommonErrors.WrongType)],
            },
            4: {
                foo: [errorWithCode(CommonErrors.Required)],
            },
            6: {
                '': [errorWithCode(CommonErrors.WrongType)],
            },
            7: {
                '': [errorWithCode(CommonErrors.WrongType)],
            },
        },
    });

    // custom validation
    expectValidation({
        schema: arraySchema,
        value: [
            {
                __typename: 'Obj',
                foo: 'bad',
            },
            {
                __typename: 'Obj',
                foo: 'asdf',
            },
        ],
        errors: {
            0: {
                foo: [{ code: 'Bad' }],
            },
        },
    });

    // invalid
    expectValidation({
        schema: arraySchema,
        value: [],
        errors: {
            '': [{ code: 'ArrayEmpty' }],
        },
    });
});
