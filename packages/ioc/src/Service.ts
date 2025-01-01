import type { EmptyObject, Writable } from '@nzyme/types';

import type { ContainerScope } from './ContainerScope.js';
import { INJECTABLE_SYMBOL, type Injectable } from './Injectable.js';
import type { Interface } from './Interface.js';
import {
    getResolutionStrategy,
    type ServiceResolutionStrategy,
    type ServiceResolutionType,
} from './serviceResolve.js';
const SERVICE_SYMBOL = Symbol('service');

export type ServiceDependencies = {
    [key: string]: Injectable;
};

export type ResolveDependencies<D extends ServiceDependencies> = keyof D extends never
    ? void
    : {
          [K in keyof D]: D[K] extends Injectable<infer T> ? T : unknown;
      };

export interface ServiceOptions<
    T = unknown,
    TExtend extends T = T,
    TDeps extends ServiceDependencies = ServiceDependencies,
> {
    readonly name?: string;
    readonly implements?: Interface<T>;
    readonly deps?: TDeps;
    readonly resolution?: ServiceResolutionType | ServiceResolutionStrategy;
    readonly scope?: ContainerScope;
    readonly setup: ServiceConstructor<TExtend, TDeps>;
}

export type ServiceConstructor<
    T = unknown,
    TDeps extends ServiceDependencies = ServiceDependencies,
> = (deps: ResolveDependencies<TDeps>) => T;

export type Service<
    T = unknown,
    TDeps extends ServiceDependencies = ServiceDependencies,
> = ServiceConstructor<T, TDeps> &
    Injectable<T> & {
        readonly implements?: Interface;
        readonly scope?: ContainerScope;
        readonly deps: TDeps;
    };

/*#__NO_SIDE_EFFECTS__*/
export function defineService<
    T,
    TExtend extends T = T,
    TDeps extends ServiceDependencies = EmptyObject,
>(options: ServiceOptions<T, TExtend, TDeps>): Service<TExtend, TDeps> {
    const name = options.name ?? options.implements?.name ?? 'UnnamedService';
    const resolution = getResolutionStrategy(options.resolution ?? 'singleton');

    const wrapper: { [key: string]: ServiceConstructor<TExtend, TDeps> } = {
        [name](deps) {
            return options.setup(deps);
        },
    };

    const service = wrapper[name] as unknown as Writable<Service<TExtend, TDeps>>;

    service[INJECTABLE_SYMBOL] = SERVICE_SYMBOL;
    service.implements = options.implements as Interface;
    service.scope = options.scope;
    service.deps = options.deps ?? ({} as TDeps);
    service.resolve = (container, caller) =>
        resolution({
            service: service as unknown as Service,
            options: options as unknown as ServiceOptions,
            container,
            caller,
        }) as TExtend;

    return service as Service<TExtend, TDeps>;
}

export function isService<T>(value: Injectable<T>): value is Service<T>;
export function isService(value: unknown): value is Service;
export function isService(value: unknown) {
    return value != null && (value as Injectable)[INJECTABLE_SYMBOL] === SERVICE_SYMBOL;
}
