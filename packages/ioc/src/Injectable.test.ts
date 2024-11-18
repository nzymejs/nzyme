import { test, expect } from 'vitest';

import { createContainer } from './Container.js';
import { defineScope } from './ContainerScope.js';
import { defineInjectable } from './Injectable.js';

test('register and get injectable', () => {
    const container = createContainer();
    const injectable = defineInjectable<string>();

    container.set(injectable, 'test');
    expect(container.get(injectable)).toBe('test');
});

test('register and get named injectable', () => {
    const container = createContainer();
    const injectable = defineInjectable<string>({
        name: 'test',
    });

    container.set(injectable, 'test');
    expect(container.get(injectable)).toBe('test');
});

test('get non registered injectable', () => {
    const container = createContainer();
    const injectable = defineInjectable<string>({
        name: 'test',
    });

    expect(container.get(injectable)).toBe(undefined);
});

test('resolve injectable from parent container', () => {
    const parent = createContainer();
    const childScope = defineScope('child');
    const child = parent.createChild(childScope);

    const injectable = defineInjectable<string>({
        name: 'test',
    });

    parent.set(injectable, 'test');

    expect(child.get(injectable)).toBe(undefined);
    expect(child.resolve(injectable)).toBe('test');
});
