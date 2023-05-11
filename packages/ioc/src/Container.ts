import { Constructor, Flatten } from '@nzyme/types';

import { Executable } from './Executable.js';
import { Factory } from './Factory.js';
import { Injectable } from './Injectable.js';
import { Resolvable } from './Resolvable.js';
import { Service } from './Service.js';

export type ResolveDeps = {
    [key: string]: Injectable<unknown> | Constructor<Container>;
};

export type ResolveResult<TDeps extends ResolveDeps = Record<string, Injectable>> = Flatten<{
    [K in keyof TDeps]: TDeps[K] extends Injectable<infer T>
        ? T
        : TDeps[K] extends Constructor<Container>
        ? Container
        : never;
}>;

export class Container {
    private instances = new Map<symbol, unknown>();
    private resolvers = new Map<symbol, Resolvable>();

    public get<T>(injectable: Injectable<T>) {
        const instance = this.instances.get(injectable.symbol);
        return instance as T | undefined;
    }

    public set<T, TDeps extends ResolveDeps>(
        injectable: Injectable<T>,
        service: Resolvable<T, TDeps> | Factory<T, TDeps>,
    ): void;
    public set<T>(injectable: Injectable<T>, instance: T): void;
    public set<T>(injectable: Injectable<T>, instanceOrService: T | Service<T>): void {
        if (instanceOrService instanceof Resolvable) {
            if (instanceOrService.for !== injectable) {
                const injectableName = injectable.name ?? '';
                const serviceName = instanceOrService.name ?? '';
                throw new Error(`Service ${serviceName} is not registered for ${injectableName}`);
            }

            this.resolvers.set(injectable.symbol, instanceOrService);
        } else {
            this.instances.set(injectable.symbol, instanceOrService);
        }
    }

    public resolve<T>(injectable: Injectable<T>): T {
        return this.resolveInstance(injectable) as T;
    }

    public execute<T, TDeps extends ResolveDeps>(executable: Executable<T, TDeps>) {
        const deps = this.resolveDeps(executable.deps);
        return executable.execute(deps);
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

            instance = this.resolveResolvable(resolver, scope);
            if (resolver.cached) {
                this.instances.set(injectable.symbol, instance);
                this.instances.set(resolver.symbol, instance);
            }

            return instance;
        }

        if (injectable instanceof Resolvable) {
            instance = this.resolveResolvable(injectable as Resolvable, scope);

            if (instance && injectable.cached) {
                this.instances.set(injectable.symbol, instance);
            }
        }

        if (instance == null) {
            throw new Error(`Service ${injectable.name ?? ''} was not registered`);
        }

        return instance;
    }

    private resolveResolvable(resolvable: Resolvable, scope?: Injectable) {
        const deps = resolvable.deps ? this.resolveDeps(resolvable.deps) : {};
        return resolvable.resolve(deps, scope);
    }

    private resolveDeps<TDeps extends ResolveDeps>(
        config: TDeps,
        scope?: Injectable,
    ): ResolveResult<TDeps> {
        const result = {} as ResolveResult<TDeps>;

        for (const key in config) {
            const injectable = config[key];
            if (injectable === Container) {
                result[key as keyof TDeps] = this as ResolveResult<TDeps>[keyof TDeps];
            } else {
                const value = this.resolveInstance(injectable as Injectable, scope);
                result[key as keyof TDeps] = value as ResolveResult<TDeps>[keyof TDeps];
            }
        }

        return result;
    }
}
