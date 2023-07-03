import { SchemaError, ObjectSchema, StringSchema, SchemaValue, IntSchema } from '@nzyme/schema';

test('simple object schema', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            /** This is FOO */
            foo: new StringSchema(),
        },
    });

    const foo = Foo.coerce({
        foo: 'asdf',
    });

    const cast: SchemaValue<typeof Foo> = foo;

    expect(Foo.props.foo).toBeDefined();
    expect(Foo.descriptor.base).toBe(null);
    expect(foo.__typename).toBe('Foo');
    expect(foo.foo).toBe('asdf');
    expect(Foo.is(foo)).toBe(true);
});

test('nested object schema', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        props: {
            /** This is FOO */
            foo: new StringSchema(),
        },
    });

    type Foo = SchemaValue<typeof Foo>;

    const Bar = ObjectSchema.define({
        type: 'Bar',
        props: {
            /** This is BAR */
            bar: new Foo(),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    const bar = Bar.coerce({
        bar: Foo.coerce({
            foo: 'asdf',
        }),
        baz: 'asdf',
    });

    const cast: SchemaValue<typeof Bar> = bar;

    expect(Bar.props.bar).toBeDefined();
    expect(Bar.props.baz).toBeDefined();
    expect(Bar.descriptor.base).toBe(null);
});

test('single level inheritance from abstract schema', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        base: Foo,
        props: {
            bar: new IntSchema(),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    const bar = Bar.coerce({
        foo: 'asdf',
        bar: 213,
        baz: null,
    });

    const cast: SchemaValue<typeof Foo> = bar;

    expect(Bar.props.foo).toBeDefined();
    expect(Bar.props.bar).toBeDefined();
    expect(Bar.props.baz).toBeDefined();
    expect(Bar.is(bar)).toBe(true);
    expect(Bar.descriptor.base).toBe(Foo.descriptor);
});

test('single level inheritance with two inherited types', () => {
    const Base = ObjectSchema.define({
        type: 'Foo',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const Child1 = ObjectSchema.define({
        type: 'Bar',
        base: Base,
        props: {
            bar: new IntSchema(),
        },
    });

    const Child2 = ObjectSchema.define({
        type: 'Baz',
        base: Base,
        props: {
            baz: new IntSchema(),
        },
    });

    const child1 = Child1.coerce({
        foo: 'asdf',
        bar: 213,
    });

    const child2 = Child2.coerce({
        foo: 'asdf',
        baz: 213,
    });

    expect(Child1.props.foo).toBeDefined();
    expect(Child1.props.bar).toBeDefined();
    expect(Child2.props.foo).toBeDefined();
    expect(Child2.props.baz).toBeDefined();
    expect(child1.__typename).toBe('Bar');
    expect(child2.__typename).toBe('Baz');
    expect(Child1.is(child1)).toBe(true);
    expect(Child1.is(child2)).toBe(false);
    expect(Child2.is(child2)).toBe(true);
    expect(Child2.is(child1)).toBe(false);
    // should be polymorphic
    expect(Child1.descriptor.base).toBe(Base.descriptor);
    expect(Child2.descriptor.base).toBe(Base.descriptor);
    expect(Base.is(child1)).toBe(true);
    expect(Base.is(child2)).toBe(true);
    // but should not match any object
    expect(Base.is({ xx: 123 })).toBe(false);
    expect(Child1.is({ xx: 123 })).toBe(false);
    expect(Child2.is({ xx: 123 })).toBe(false);
});

test('abstract object schema', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        abstract: true,
        props: {
            /** This is FOO */
            foo: new StringSchema(),
        },
    });

    expect(Foo.props.foo).toBeDefined();
    expect(Foo.descriptor.base).toBe(null);

    const foo = new Foo();

    expect(() => foo.defaultValue()).toThrowError(SchemaError);
});

test('multi level inheritance from abstract', () => {
    const Base = ObjectSchema.define({
        type: 'Base',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const Child = ObjectSchema.define({
        type: 'Child',
        abstract: true,
        base: Base,
        props: {
            bar: new IntSchema(),
        },
    });

    const GrandChild = ObjectSchema.define({
        type: 'Bar',
        base: Child,
        props: {
            baz: new IntSchema(),
        },
    });

    const Other = ObjectSchema.define({
        type: 'Other',
        props: {
            bar: new IntSchema(),
        },
    });

    expect(Child.props.foo).toBeDefined();
    expect(Child.props.bar).toBeDefined();
    expect(GrandChild.props.foo).toBeDefined();
    expect(GrandChild.props.bar).toBeDefined();
    expect(GrandChild.props.baz).toBeDefined();

    expect(Child.descriptor.base).toBe(Base.descriptor);
    expect(GrandChild.descriptor.base).toBe(Child.descriptor);

    const grandChild = GrandChild.coerce({
        foo: 'asdf',
        bar: 213,
        baz: 213,
    });

    const parentCast: SchemaValue<typeof Base> = grandChild;
    const childCast: SchemaValue<typeof Child> = grandChild;

    // Should fall back to the first inheriting class
    expect(new Base().defaultValue()).toEqual(new GrandChild().defaultValue());
    expect(new Child().defaultValue()).toEqual(new GrandChild().defaultValue());

    expect(grandChild.__typename).toBe('Bar');

    expect(Base.is(grandChild)).toBe(true);
    expect(Child.is(grandChild)).toBe(true);
    expect(GrandChild.is(grandChild)).toBe(true);
    expect(Other.is(grandChild)).toBe(false);

    // but should not match any object
    expect(Base.is({ xx: 123 })).toBe(false);
    expect(Child.is({ xx: 123 })).toBe(false);
    expect(GrandChild.is({ xx: 123 })).toBe(false);
});

test('abstract schema extend as concrete', () => {
    const Base = ObjectSchema.define({
        type: 'Base',
        abstract: true,
        props: {
            foo: new StringSchema(),
        },
    });

    const Child = ObjectSchema.define({
        type: 'Bar',
        base: Base,
        props: {
            bar: new IntSchema(),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    const child = Child.coerce({
        foo: 'asdf',
        bar: 213,
        baz: null,
    });

    const cast: SchemaValue<typeof Base> = child;

    expect(Child.props.foo).toBeDefined();
    expect(Child.props.bar).toBeDefined();
    expect(Child.props.baz).toBeDefined();
    expect(child.__typename).toBe('Bar');
    expect(Child.is(child)).toBe(true);
    // should be polymorphic
    expect(Child.descriptor.base).toBe(Base.descriptor);
    expect(Base.is(child)).toBe(true);
    // but should not match any object
    expect(Child.is({ xx: 123 })).toBe(false);
    expect(Base.is({ xx: 123 })).toBe(false);
});

test('single level inheritance from open object schema', () => {
    const Foo = ObjectSchema.define({
        type: 'Foo',
        sealed: false,
        props: {
            foo: new StringSchema(),
        },
    });

    const Bar = ObjectSchema.define({
        type: 'Bar',
        base: Foo,
        props: {
            bar: new IntSchema(),
            baz: new StringSchema({
                nullable: true,
            }),
        },
    });

    const foo = Foo.coerce({
        foo: 'qwer',
    });

    const bar = Bar.coerce({
        foo: 'asdf',
        bar: 213,
        baz: null,
    });

    const castFoo: SchemaValue<typeof Foo> = foo;
    const castBar: SchemaValue<typeof Foo> = bar;

    expect(foo.__typename).toBe('Foo');
    expect(bar.__typename).toBe('Bar');

    expect(Bar.props.foo).toBe(Foo.props.foo);
    expect(Bar.props.bar).toBeDefined();
    expect(Bar.props.baz).toBeDefined();
    expect(Bar.descriptor.base).toBe(Foo.descriptor);

    expect(Bar.is(bar)).toBe(true);
    expect(Bar.is(foo)).toBe(false);

    expect(Foo.is(foo)).toBe(true);
    expect(Foo.is(bar)).toBe(true);
    expect(Foo.is({ xx: 123 })).toBe(false);
});
