import type { Executable } from './Executable.js';
import type { Injectable } from './Injectable.js';
import { Resolvable } from './Resolvable.js';

export class Container {
    private instances = new Map<symbol, unknown>();
    private resolvers = new Map<symbol, Resolvable>();

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
    public resolve<T>(injectable: Injectable<T>, scope?: Injectable): T;
    /**
     * Resolves multiple injectables.
     * @param injectables Injectables to be resolved.
     * @returns Resolved value of the injectable.
     */
    public resolve<T extends Injectable[]>(
        injectables: T,
        scope?: Injectable,
    ): T[number] extends Injectable<infer U> ? [U] : [];
    public resolve(injectable: Injectable | Injectable[], scope?: Injectable) {
        if (Array.isArray(injectable)) {
            return injectable.map(i => this.resolveInstance(i, scope));
        }

        return this.resolveInstance(injectable, scope);
    }

    public execute<T>(executable: Executable<T>) {
        return this.resolve(executable)();
    }

    private resolveInstance(injectable: Injectable, scope?: Injectable): unknown {
        let instance = this.instances.get(injectable.symbol);
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const resolver = this.resolvers.get(injectable.symbol);
        if (resolver) {
            instance = this.instances.get(resolver.symbol);
            if (instance) {
                // Cache it for later
                this.instances.set(injectable.symbol, instance);
                return instance;
            }

            instance = resolver.resolve(this, scope);
            if (resolver.cached) {
                this.instances.set(injectable.symbol, instance);
                this.instances.set(resolver.symbol, instance);
            }

            return instance;
        }

        if (injectable instanceof Resolvable) {
            instance = injectable.resolve(this, scope);

            if (instance && injectable.cached) {
                this.instances.set(injectable.symbol, instance);
            }
        }

        if (instance == null) {
            throw new Error(`Service ${injectable.name ?? ''} was not registered`);
        }

        return instance;
    }
}
