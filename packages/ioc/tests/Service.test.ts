import { Container, defineInjectable, defineService } from '@nzyme/ioc';

test('resolve service with no deps', () => {
    const container = new Container();

    let count = 0;

    const service = defineService({
        deps: {},
        setup({}) {
            count++;
            return 'foo';
        },
    });

    let resolved = container.resolve(service);
    expect(resolved).toBe('foo');
    expect(count).toBe(1);

    // Should be cached
    resolved = container.resolve(service);
    expect(resolved).toBe('foo');
    expect(count).toBe(1);
});

test('resolve service with deps', () => {
    let service1Count = 0;
    let service2Count = 0;
    let service3Count = 0;

    const service1 = defineService({
        name: 'service1',
        setup({}) {
            service1Count++;
            return 'service1';
        },
    });

    const service2 = defineService({
        name: 'service2',
        deps: {
            service1,
        },
        setup({ service1 }) {
            service2Count++;
            expect(service1).toBe('service1');
            return 'service2';
        },
    });

    const service3 = defineService({
        name: 'service3',
        deps: {
            service1,
            service2,
        },
        setup({ service1, service2 }) {
            service3Count++;
            expect(service1).toBe('service1');
            expect(service2).toBe('service2');
            return 'service3';
        },
    });

    const container = new Container();

    expect(service1Count).toBe(0);
    expect(service2Count).toBe(0);
    expect(service3Count).toBe(0);

    const service2Resolved = container.resolve(service2);
    expect(service2Resolved).toBe('service2');
    expect(service1Count).toBe(1);
    expect(service2Count).toBe(1);
    expect(service3Count).toBe(0);

    const service3Resolved = container.resolve(service3);
    expect(service3Resolved).toBe('service3');
    expect(service1Count).toBe(1);
    expect(service2Count).toBe(1);
    expect(service3Count).toBe(1);

    const service1Resolved = container.resolve(service1);
    expect(service1Resolved).toBe('service1');
    expect(service1Count).toBe(1);
    expect(service2Count).toBe(1);
    expect(service3Count).toBe(1);
});

test('register service as injectable', () => {
    const injectable = defineInjectable<string>({
        name: 'foobar',
    });
    let serviceCount = 0;

    const service = defineService({
        for: injectable,
        name: 'service',
        setup({}) {
            serviceCount++;
            return 'service';
        },
    });

    const container = new Container();

    container.set(injectable, service);
    const injectableInstance1 = container.resolve(injectable);
    const injectableInstance2 = container.resolve(injectable);
    const serviceInstance1 = container.resolve(service);
    const serviceInstance2 = container.resolve(service);

    expect(injectableInstance1).toBe('service');
    expect(injectableInstance2).toBe('service');
    expect(serviceInstance1).toBe('service');
    expect(serviceInstance2).toBe('service');
    expect(serviceCount).toBe(1);
});
