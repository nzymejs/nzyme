import { Container, defineFactory, defineInjectable, defineService } from '@nzyme/ioc';

test('resolve factory with no deps', () => {
    const container = new Container();

    let count = 0;

    const factory = defineFactory({
        deps: {},
        setup({}) {
            count++;
            return 'foo';
        },
    });

    let resolved = container.resolve(factory);
    expect(resolved).toBe('foo');
    expect(count).toBe(1);

    resolved = container.resolve(factory);
    expect(resolved).toBe('foo');
    expect(count).toBe(2);

    resolved = container.resolve(factory);
    expect(resolved).toBe('foo');
    expect(count).toBe(3);
});

test('resolve factory registered as injectable', () => {
    const container = new Container();

    let count = 0;

    const injectable = defineInjectable<string>();

    const factory = defineFactory({
        for: injectable,
        setup({}) {
            count++;
            return 'foo';
        },
    });

    container.set(injectable, factory);

    let resolved = container.resolve(injectable);
    expect(resolved).toBe('foo');
    expect(count).toBe(1);

    resolved = container.resolve(injectable);
    expect(resolved).toBe('foo');
    expect(count).toBe(2);

    resolved = container.resolve(injectable);
    expect(resolved).toBe('foo');
    expect(count).toBe(3);
});

test('resolve service with factory dep', () => {
    const container = new Container();

    let count = 0;

    const factory = defineFactory({
        deps: {},
        setup({}) {
            count++;
            return 'foo';
        },
    });

    const service = defineService({
        deps: {
            factory,
        },
        setup({ factory }) {
            return factory + 'bar';
        },
    });

    let resolved = container.resolve(service);
    expect(resolved).toBe('foobar');
    expect(count).toBe(1);

    resolved = container.resolve(service);
    expect(resolved).toBe('foobar');
    expect(count).toBe(1);
});
