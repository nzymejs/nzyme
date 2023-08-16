import { Container } from './Container.js';
import { Injectable } from './Injectable.js';
import { Resolvable, ResolvableOptions } from './Resolvable.js';

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
            inject: injectable => container.resolve(injectable),
        });
    }
}

export interface ServiceContext {
    readonly container: Container;
    readonly inject: <T>(injectable: Injectable<T>) => T;
}

export interface ServiceOptions<T> extends ResolvableOptions<T> {
    readonly setup: (ctx: ServiceContext) => T;
}

export function defineService<T>(definition: ServiceOptions<T>): Service<T> {
    return new Service(definition);
}
