import { test, expect } from 'vitest';

import { Container } from './Container.js';
import { defineFactory } from './Factory.js';
import { defineInjectable } from './Injectable.js';
import { defineService } from './Service.js';

test('resolve factory with no deps', () => {
    const container = new Container();

    let count = 0;

    const factory = defineFactory({
        setup() {
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
        setup() {
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
        setup() {
            count++;
            return 'foo';
        },
    });

    const service = defineService({
        setup({ inject }) {
            return inject(factory) + 'bar';
        },
    });

    let resolved = container.resolve(service);
    expect(resolved).toBe('foobar');
    expect(count).toBe(1);

    resolved = container.resolve(service);
    expect(resolved).toBe('foobar');
    expect(count).toBe(1);
});
