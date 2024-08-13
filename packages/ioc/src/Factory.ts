import type { Container } from './Container.js';
import type { Injectable } from './Injectable.js';
import type { ResolvableOptions } from './Resolvable.js';
import { Resolvable } from './Resolvable.js';

export class Factory<T> extends Resolvable<T> {
    constructor(private readonly def: FactoryOptions<T>) {
        super(def);
    }

    public override get cached() {
        return false;
    }

    public override resolve(container: Container, scope?: Injectable) {
        return this.def.setup({
            container,
            scope,
            inject: injectable => container.resolve(injectable, this),
        });
    }
}

export interface FactoryContext {
    readonly container: Container;
    readonly scope?: Injectable;
    readonly inject: <T>(injectable: Injectable<T>) => T;
}

export interface FactoryOptions<T> extends ResolvableOptions<T> {
    readonly setup: (ctx: FactoryContext) => T;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineFactory<T>(definition: FactoryOptions<T>): Factory<T> {
    return new Factory(definition);
}
