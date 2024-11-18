import type { ContainerScope } from './ContainerScope.js';
import type { Injectable } from './Injectable.js';
import type { Module } from './Module.js';
import { isService, type Service } from './Service.js';

export type ContainerOptions = {
    parent?: Container;
    scope?: ContainerScope;
    resolve?: (service: Service, scope?: Injectable) => unknown;
    createChild?: (scope: ContainerScope) => Container;
};

export type Container = {
    readonly parent?: Container;
    readonly scope?: ContainerScope;
    addModule<TParams extends unknown[], TResult>(
        this: void,
        module: Module<TParams, TResult>,
        ...params: TParams
    ): void;
    createChild(this: void, scope: ContainerScope): Container;
    get<T>(this: void, injectable: Injectable<T>): T | undefined;
    set<T>(this: void, injectable: Injectable<T>, instance: T): void;
    set<T>(this: void, injectable: Injectable<T>, service: Service<T>): void;
    resolve<T>(this: void, injectable: Injectable<T>, source?: Injectable): T;
    tryResolve<T>(this: void, injectable: Injectable<T>, source?: Injectable): T | undefined;
};

export function createContainer(options?: ContainerOptions) {
    const instances = new Map<symbol, unknown>();
    const services = new Map<symbol, Service>();
    const parent = options?.parent;
    const scope = options?.scope;
    const resolve = options?.resolve ?? ((service, source) => service.resolve(container, source));
    const createChild =
        options?.createChild ?? (scope => createContainer({ parent: container, scope }));

    const container: Container = {
        addModule: (module, ...params) => module(container, ...params),
        createChild,
        get: <T>(injectable: Injectable<T>) => instances.get(injectable.key) as T | undefined,
        set: (injectable, instanceOrService) => {
            if (isService(instanceOrService)) {
                services.set(injectable.key, instanceOrService);
            } else {
                instances.set(injectable.key, instanceOrService);
            }
        },
        resolve: <T>(injectable: Injectable<T>, scope?: Injectable) => {
            const instance = tryResolve(injectable, scope);
            if (instance == null) {
                throw new Error(`Service ${injectable.name ?? ''} was not registered`);
            }

            return instance;
        },
        tryResolve,
    };

    return container;

    function tryResolve<T>(injectable: Injectable<T>, source?: Injectable): T | undefined {
        const instance = instances.get(injectable.key) as T | undefined;
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const service = services.get(injectable.key) as Service<T> | undefined;
        if (service) {
            return resolveService(service, source);
        }

        if (isService(injectable)) {
            return resolveService(injectable, source);
        }

        return parent?.tryResolve(injectable, source);
    }

    function resolveService<T>(service: Service<T>, source?: Injectable): T | undefined {
        if (service.scope !== scope) {
            return parent?.tryResolve(service, source);
        }

        return resolve(service, source) as T | undefined;
    }
}
