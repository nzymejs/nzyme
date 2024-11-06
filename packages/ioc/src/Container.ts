import type { Injectable } from './Injectable.js';
import type { Module } from './Module.js';
import { isResolvable, Resolvable } from './Resolvable.js';

export type ContainerOptions = {
    parent?: Container;
    resolve?: (resolvable: Resolvable, scope?: Injectable) => unknown;
    child?: () => Container;
};

export type Container = {
    readonly parent?: Container;
    addModule<TParams extends unknown[], TResult>(
        this: void,
        module: Module<TParams, TResult>,
        ...params: TParams
    ): void;
    createChild(this: void): Container;
    get<T>(this: void, injectable: Injectable<T>): T | undefined;
    set<T>(this: void, injectable: Injectable<T>, instance: T): void;
    set<T>(this: void, injectable: Injectable<T>, service: Resolvable<T>): void;
    resolve<T>(this: void, injectable: Injectable<T>, scope?: Injectable): T;
    tryResolve<T>(this: void, injectable: Injectable<T>, scope?: Injectable): T | undefined;
};

export function createContainer(options?: ContainerOptions) {
    const instances = new Map<symbol, unknown>();
    const resolvers = new Map<symbol, Resolvable>();
    const parent = options?.parent;
    const doResolve =
        options?.resolve ?? ((resolvable, scope) => resolvable.resolve(container, scope));
    const createChild = options?.child ?? (() => createContainer({ parent }));

    const container: Container = {
        addModule: (module, ...params) => module(container, ...params),
        createChild,
        get: <T>(injectable: Injectable<T>) => instances.get(injectable.symbol) as T | undefined,
        set: (injectable, instanceOrService) => {
            if (instanceOrService instanceof Resolvable) {
                resolvers.set(injectable.symbol, instanceOrService);
            } else {
                instances.set(injectable.symbol, instanceOrService);
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

    function tryResolve<T>(injectable: Injectable<T>, scope?: Injectable): T | undefined {
        let instance = instances.get(injectable.symbol) as T | undefined;
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const resolver = resolvers.get(injectable.symbol) as Resolvable<T> | undefined;
        if (resolver) {
            instance = instances.get(resolver.symbol) as T | undefined;
            if (instance) {
                // Cache it for later
                instances.set(injectable.symbol, instance);
                return instance;
            }

            instance = doResolve(resolver, scope) as T | undefined;
            if (resolver.cached) {
                instances.set(injectable.symbol, instance);
                instances.set(resolver.symbol, instance);
            }

            return instance;
        }

        if (isResolvable(injectable)) {
            if (injectable.scope === 'root') {
                if (parent) {
                    instance = parent.tryResolve(injectable, scope);
                } else {
                    instance = doResolve(injectable, scope) as T | undefined;
                }
            } else if (!parent) {
                // Not possible to resolve a child service in a root container
                return undefined;
            } else if (parent.parent) {
                instance =
                    parent.get(injectable) ?? (doResolve(injectable, scope) as T | undefined);
            } else {
                instance = doResolve(injectable, scope) as T | undefined;
            }

            if (instance && injectable.cached) {
                instances.set(injectable.symbol, instance);
            }
        }

        if (instance == null && parent) {
            return parent.tryResolve(injectable, scope);
        }

        return instance;
    }
}
