import { Constructor, Flatten } from '@nzyme/types';

import { Executable } from './Executable';
import { Factory } from './Factory';
import { Injectable } from './Injectable';
import { Resolvable } from './Resolvable';
import { Service } from './Service';

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
    private instances = new Map<Injectable<unknown>, unknown>();
    private resolvers = new Map<Injectable<unknown>, Resolvable>();

    public get<T>(injectable: Injectable<T>) {
        const instance = this.instances.get(injectable);
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

            this.resolvers.set(injectable, instanceOrService);
        } else {
            this.instances.set(injectable, instanceOrService);
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
        let instance = this.instances.get(injectable);
        if (instance) {
            return instance;
        }

        // Try to resolve as a registered service
        const resolver = this.resolvers.get(injectable);
        if (resolver) {
            instance = this.instances.get(resolver);
            if (instance) {
                // Cache it for later
                this.instances.set(injectable, instance);
                return instance;
            }

            instance = this.resolveResolvable(resolver, scope);
            if (resolver.cached) {
                this.instances.set(injectable, instance);
                this.instances.set(resolver, instance);
            }

            return instance;
        }

        if (injectable instanceof Resolvable) {
            instance = this.resolveResolvable(injectable, scope);

            if (instance && injectable.cached) {
                this.instances.set(injectable, instance);
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
