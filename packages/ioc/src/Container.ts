import type { Injectable } from './Injectable.js';
import type { Module } from './Module.js';
import { Resolvable } from './Resolvable.js';

export class Container {
    private readonly instances = new Map<symbol, unknown>();
    private readonly resolvers = new Map<symbol, Resolvable>();
    private readonly parent?: Container;

    constructor(parent?: Container) {
        this.parent = parent;
    }

    public addModule<TParams extends unknown[], TResult>(
        module: Module<TParams, TResult>,
        ...params: TParams
    ) {
        return module(this, ...params);
    }

    public createChild() {
        return new Container(this);
    }

    public get<T>(injectable: Injectable<T>) {
        const instance = this.instances.get(injectable.symbol);
        return instance as T | undefined;
    }

    public set<T>(injectable: Injectable<T>, instance: T): void;
    public set<T>(injectable: Injectable<T>, service: Resolvable<T>): void;
    public set<T>(injectable: Injectable<T>, instanceOrService: T | Resolvable<T>): void {
        if (instanceOrService instanceof Resolvable) {
            if (instanceOrService.for !== injectable) {
                const injectableName = injectable.name ?? '';
                const serviceName = instanceOrService.name ?? '';
                throw new Error(
                    `Service ${serviceName} is not cannot be resolved as ${injectableName}`,
                );
            }

            this.resolvers.set(injectable.symbol, instanceOrService);
        } else {
            this.instances.set(injectable.symbol, instanceOrService);
        }
    }

    /**
     * Resolves a single injectable.
     * @param injectable Injectable to be resolved.
     * @returns Resolved value of the injectable.
     */
    public resolve<T>(injectable: Injectable<T>, scope?: Injectable): T {
        const instance = this.tryResolve(injectable, scope);
        if (instance == null) {
            throw new Error(`Service ${injectable.name ?? ''} was not registered`);
        }

        return instance;
    }

    public tryResolve<T>(injectable: Injectable<T>, scope?: Injectable): T | undefined {
        let instance = this.instances.get(injectable.symbol) as T | undefined;
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const resolver = this.resolvers.get(injectable.symbol) as Resolvable<T> | undefined;
        if (resolver) {
            instance = this.instances.get(resolver.symbol) as T | undefined;
            if (instance) {
                // Cache it for later
                this.instances.set(injectable.symbol, instance);
                return instance;
            }

            instance = this.doResolve(resolver, scope);
            if (resolver.cached) {
                this.instances.set(injectable.symbol, instance);
                this.instances.set(resolver.symbol, instance);
            }

            return instance;
        }

        if (injectable instanceof Resolvable) {
            if (injectable.scope === 'root' && this.parent) {
                instance = this.parent.tryResolve(injectable, scope) as T | undefined;
            } else if (injectable.scope === 'child' && !this.parent) {
                // Not possible to resolve a child service in a root container
                return undefined;
            } else {
                instance = this.doResolve(injectable, scope) as T | undefined;
            }

            if (instance && injectable.cached) {
                this.instances.set(injectable.symbol, instance);
            }
        }

        if (instance == null && this.parent) {
            return this.parent.tryResolve(injectable, scope);
        }

        return instance;
    }

    protected doResolve<T>(resolvable: Resolvable<T>, scope?: Injectable): T | undefined {
        return resolvable.resolve(this, scope);
    }
}
