import { createMemo, noop } from '@nzyme/utils';

import type { Container } from './Container.js';
import type { ContainerScope } from './ContainerScope.js';
import {
    INJECTABLE_SYMBOL,
    type Injectable,
    type InjectableKey,
    type InjectableOptions,
} from './Injectable.js';

export const SERVICE_SYMBOL = Symbol('service');

export interface ServiceContext {
    readonly container: Container;
    readonly inject: <T>(injectable: Injectable<T>) => T;
    readonly source?: Injectable;
}

export type ServiceResolutionParams<T = unknown> = {
    service: Service<T>;
    options: ServiceOptions<unknown, T>;
    container: Container;
    source?: Injectable;
};
export type ServiceResolutionStrategy<T = unknown> = (params: ServiceResolutionParams<T>) => T;
export type ServiceResolutionType = 'transient' | 'singleton' | 'lazy';
export type ServiceSetup<T = unknown> = (ctx: ServiceContext) => T;

export interface ServiceOptions<T, TExtend extends T = T> {
    readonly for?: Injectable<T>;
    readonly resolution?: ServiceResolutionType | ServiceResolutionStrategy<TExtend>;
    readonly scope?: ContainerScope;
    readonly setup: ServiceSetup<TExtend>;
}

export interface Service<T = unknown> extends Injectable<T> {
    readonly [SERVICE_SYMBOL]: true;
    readonly for?: Injectable;
    readonly scope?: ContainerScope;
    readonly resolve: (container: Container, source?: Injectable) => T;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineService<
    T,
    TExtend extends T = T,
    TOptions extends InjectableOptions = InjectableOptions,
>(options: ServiceOptions<T, TExtend> & TOptions) {
    const resolution = resolveStrategy(options.resolution ?? 'singleton');

    const service: Service<TExtend> & TOptions = {
        ...options,
        [INJECTABLE_SYMBOL]: true,
        [SERVICE_SYMBOL]: true,
        key: Symbol(options?.name) as InjectableKey<TExtend>,
        resolve: (container, source) => resolution({ service, options, container, source }),
    };

    return Object.freeze(service);
}

export function isService<T>(value: Injectable<T>): value is Service<T>;
export function isService(value: unknown): value is Service;
export function isService(value: unknown) {
    return value != null && (value as Service)[SERVICE_SYMBOL] === true;
}

function resolveStrategy<T>(strategy: ServiceResolutionType | ServiceResolutionStrategy<T>) {
    if (typeof strategy === 'function') {
        return strategy;
    }

    switch (strategy) {
        case 'transient':
            return transientStrategy as ServiceResolutionStrategy<T>;
        case 'singleton':
            return singletonStrategy as ServiceResolutionStrategy<T>;
        case 'lazy':
            return lazyStrategy as ServiceResolutionStrategy<T>;
    }
}

export function singletonStrategy<T>({
    service,
    options,
    container,
    source,
}: ServiceResolutionParams<T>) {
    const instance = options.setup({
        container,
        inject: container.resolve,
        source,
    });

    container.set(service, instance);

    if (options.for && !container.get(options.for)) {
        container.set(options.for, instance);
    }

    return instance;
}

export function transientStrategy<T>({ options, container, source }: ServiceResolutionParams<T>) {
    return options.setup({
        container,
        inject: injectable => container.resolve(injectable, source),
    });
}

export function lazyStrategy<T>(params: ServiceResolutionParams<T>) {
    // Short-circuit if already resolved
    const existing = params.container.get(params.service);
    if (existing) {
        return existing;
    }

    const memo = createMemo(() => singletonStrategy(params));
    const proxy = new Proxy(noop, {
        get: (target, prop) => {
            return (memo() as Record<string | symbol, unknown>)[prop];
        },
        set: (target, prop, value) => {
            (memo() as Record<string | symbol, unknown>)[prop] = value;
            return true;
        },
        has: (target, prop) => {
            return prop in (memo() as Record<string | symbol, unknown>);
        },
        apply: (target, thisArg, args: unknown[]) => {
            return (memo() as (...args: unknown[]) => unknown)(...args);
        },
    });

    return proxy;
}
