import { IntSchema, ObjectSchema, StringSchema } from '@nzyme/schema';

test('default value from props', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            foo: new StringSchema(),
            bar: new IntSchema({ default: 10 }),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    expect(new Foo().defaultValue()).toEqual({
        __typename: 'Foo',
        foo: '',
        bar: 10,
        baz: null,
    });
});

test('default value from extended schema', () => {
    const Base = ObjectSchema.define({
        type: 'Foo',
        abstract: true,
        props: {
            foo: new StringSchema(),
            bar: new IntSchema({ default: 10 }),
        },
    });

    const Inherited = ObjectSchema.define({
        type: 'Bar',
        base: Base,
        props: {
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    expect(new Inherited().defaultValue()).toEqual({
        __typename: 'Bar',
        foo: '',
        bar: 10,
        baz: null,
    });
});

test('default value custom function', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            foo: new StringSchema(),
            bar: new IntSchema({
                default: 10,
            }),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    const schema = new Foo({
        default() {
            return {
                foo: 'xx',
                bar: 14,
                baz: '111',
            };
        },
    });

    expect(schema.defaultValue()).toEqual({
        __typename: 'Foo',
        foo: 'xx',
        bar: 14,
        baz: '111',
    });
});
