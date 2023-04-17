import { Container, defineInjectable } from '@nzyme/ioc';

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
