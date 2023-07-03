import { SchemaValue, ObjectSchema, StringSchema, ArraySchema, IntSchema } from '@nzyme/schema';

test('int property is set to 0 by default', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),
            count: new IntSchema(),
        },
    });

    const value = Foo.coerce({
        name: 'asdf',
    });

    const expected: SchemaValue<typeof Foo> = {
        __typename: 'Foo',
        name: 'asdf',
        count: 0,
    };

    expect(value).toEqual(expected);
});

test('int property is set to custom default value', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),
            count: new IntSchema({
                default: 10,
            }),
        },
    });

    const value = Foo.coerce({
        name: 'asdf',
    });

    const expected: SchemaValue<typeof Foo> = {
        __typename: 'Foo',
        name: 'asdf',
        count: 10,
    };

    expect(value).toEqual(expected);
});

test('fill all props', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),
            count: new IntSchema(),
        },
    });

    const value = Foo.coerce({});

    const expected: SchemaValue<typeof Foo> = {
        __typename: 'Foo',
        name: '',
        count: 0,
    };

    expect(value).toEqual(expected);
});

test('nullable string prop', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema({
                nullable: true,
            }),
            count: new IntSchema(),
        },
    });

    const value = Foo.coerce({
        count: 3,
    });

    const expected: SchemaValue<typeof Foo> = {
        __typename: 'Foo',
        name: null,
        count: 3,
    };

    expect(value).toEqual(expected);
});

test('nested object', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),

            count: new IntSchema({
                default: 10,
            }),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        props: {
            foo: new Foo(),
            name: new StringSchema(),
            count: new IntSchema(),
        },
    });

    const value = Bar.coerce({
        name: 'asdf',
        foo: Foo.coerce({
            name: 'foo',
        }),
    });

    const expected: SchemaValue<typeof Bar> = {
        __typename: 'Bar',
        name: 'asdf',
        count: 0,
        foo: {
            __typename: 'Foo',
            name: 'foo',
            count: 10,
        },
    };

    expect(value).toEqual(expected);
});

test('nested nullable object', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        props: {
            name: new StringSchema(),
            foo: new Foo({
                nullable: true,
            }),
        },
    });

    const value = Bar.coerce({
        name: 'asdf',
    });

    const expected: SchemaValue<typeof Bar> = {
        __typename: 'Bar',
        name: 'asdf',
        foo: null,
    };

    expect(value).toEqual(expected);
});

test('coerce interface', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        abstract: true,
        props: {
            name: new StringSchema(),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        base: Foo,
        props: {
            count: new IntSchema(),
        },
    });

    const value = Foo.coerce({
        __typename: 'Bar',
        name: 'asdf',
    });

    const expected: SchemaValue<typeof Bar> = {
        __typename: 'Bar',
        name: 'asdf',
        count: 0,
    };

    expect(value).toEqual(expected);
});

test('coerce array of objects', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            name: new StringSchema(),
            count: new IntSchema(),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        props: {
            array: new ArraySchema(new Foo()),
        },
    });

    const value = Bar.coerce({
        __typename: 'Bar',
        array: [
            Foo.coerce({
                name: 'asdf',
            }),
            Foo.coerce({
                count: 3,
            }),
        ],
    });

    const expected: SchemaValue<typeof Bar> = {
        __typename: 'Bar',
        array: [
            {
                __typename: 'Foo',
                name: 'asdf',
                count: 0,
            },
            {
                __typename: 'Foo',
                name: '',
                count: 3,
            },
        ],
    };

    expect(value).toEqual(expected);
});
