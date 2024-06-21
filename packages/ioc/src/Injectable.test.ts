import { Container } from './Container.js';
import { defineInjectable } from './Injectable.js';

test('register and get injectable', () => {
    const container = new Container();
    const injectable = defineInjectable<string>();

    container.set(injectable, 'test');
    expect(container.get(injectable)).toBe('test');
});

test('register and get named injectable', () => {
    const container = new Container();
    const injectable = defineInjectable<string>({
        name: 'test',
    });

    container.set(injectable, 'test');
    expect(container.get(injectable)).toBe('test');
});

test('get non registered injectable', () => {
    const container = new Container();
    const injectable = defineInjectable<string>({
        name: 'test',
    });

    expect(container.get(injectable)).toBe(undefined);
});

test('resolve injectable from parent container', () => {
    const parent = new Container();
    const child = new Container(parent);

    const injectable = defineInjectable<string>({
        name: 'test',
    });

    parent.set(injectable, 'test');

    expect(child.get(injectable)).toBe(undefined);
    expect(child.resolve(injectable)).toBe('test');
});
