import type { Container } from './Container.js';
import type { Injectable } from './Injectable.js';
import type { ResolvableOptions } from './Resolvable.js';
import { Resolvable } from './Resolvable.js';

export class Service<T> extends Resolvable<T> {
    constructor(private readonly def: ServiceOptions<T>) {
        super(def);
    }

    public override get cached() {
        return true;
    }

    public override resolve(container: Container) {
        return this.def.setup({
            container,
            inject: injectable => container.resolve(injectable, this),
        });
    }
}

export interface ServiceContext {
    readonly container: Container;
    readonly inject: <T>(injectable: Injectable<T>) => T;
}

export interface ServiceOptions<T, TExtend extends T = T> extends ResolvableOptions<T> {
    readonly setup: (ctx: ServiceContext) => TExtend;
}

export function defineService<T, TExtend extends T = T>(definition: ServiceOptions<T, TExtend>) {
    return new Service<TExtend>(definition as ServiceOptions<TExtend>);
}

export function isService<T>(injectable: Injectable<T>): injectable is Service<T> {
    return injectable instanceof Service;
}
