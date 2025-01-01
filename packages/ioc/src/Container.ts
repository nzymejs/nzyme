import type { ContainerScope } from './ContainerScope.js';
import { defineInjectable, isInjectable, type Injectable } from './Injectable.js';
import type { Interface } from './Interface.js';
import type { Module } from './Module.js';
import { isService, type Service } from './Service.js';

export const CONTAINER_SYMBOL = Symbol('container');

export type ContainerOptions = {
    parent?: Container;
    scope?: ContainerScope;
    resolve?: (service: Service, scope?: Interface) => unknown;
    createChild?: (scope: ContainerScope) => Container;
};

export type Container = {
    readonly parent?: Container;
    readonly scope?: ContainerScope;
    readonly [CONTAINER_SYMBOL]: true;
    addModule<TParams extends unknown[], TResult>(
        this: void,
        module: Module<TParams, TResult>,
        ...params: TParams
    ): void;
    createChild(this: void, scope: ContainerScope): Container;
    get<T>(this: void, injectable: Injectable<T>): T | Injectable<T> | undefined;
    set<T>(this: void, injectable: Injectable<T>, instance: T): void;
    set<T>(this: void, injectable: Injectable<T>, service: Injectable<T>): void;
    resolve<T>(this: void, injectable: Injectable<T>, source?: Interface): T;
    tryResolve<T>(this: void, injectable: Injectable<T>, source?: Interface): T | undefined;
};

export const Container = defineInjectable({
    name: 'Container',
    resolve: container => container,
});

export function createContainer(options?: ContainerOptions) {
    const instances = new Map<object, unknown>();
    const injectables = new Map<object, Injectable>();
    const parent = options?.parent;
    const scope = options?.scope;
    const resolve = options?.resolve ?? ((service, source) => service.resolve(container, source));
    const createChild =
        options?.createChild ?? (scope => createContainer({ parent: container, scope }));

    const container: Container = {
        [CONTAINER_SYMBOL]: true,
        scope,
        parent,
        addModule: (module, ...params) => module(container, ...params),
        createChild,
        get,
        set,
        resolve: injectable => injectable.resolve(container),
        tryResolve,
    };

    return container;

    function get<T>(injectable: Injectable<T>): T | Injectable<T> | undefined {
        return (
            (instances.get(injectable) as T | undefined) ??
            (injectables.get(injectable) as Injectable<T> | undefined)
        );
    }

    function set<T>(injectable: Injectable<T>, instanceOrService: T | Service<T>): void {
        if (isInjectable(instanceOrService)) {
            injectables.set(injectable, instanceOrService);
        } else {
            instances.set(injectable, instanceOrService);
        }
    }

    function tryResolve<T>(injectable: Injectable<T>, source?: Interface): T | undefined {
        const instance = instances.get(injectable) as T | undefined;
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const service = injectables.get(injectable) as Service<T> | undefined;
        if (service) {
            return resolveService(service, source);
        }

        if (isService(injectable)) {
            return resolveService(injectable, source);
        }

        return parent?.tryResolve(injectable, source);
    }

    function resolveService<T>(service: Service<T>, source?: Interface): T | undefined {
        if (service.scope !== scope) {
            return parent?.tryResolve(service, source);
        }

        return resolve(service, source) as T | undefined;
    }
}

export function isContainer(value: unknown): value is Container {
    return typeof value === 'object' && value != null && CONTAINER_SYMBOL in value;
}
