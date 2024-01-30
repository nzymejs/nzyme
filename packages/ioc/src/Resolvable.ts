import { Container } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';

export abstract class Resolvable<T = unknown, TExtend extends T = T> extends Injectable<TExtend> {
    public readonly for?: Injectable<T>;

    constructor(def: ResolvableOptions<T>) {
        super(def);
        this.for = def.for;
    }

    public abstract get cached(): boolean;
    public abstract resolve(container: Container, scope?: Injectable): TExtend | undefined;

    public setup(container: Container) {
        if (this.for) {
            container.set(this.for, this);
        } else {
            container.set(this, this);
        }
    }
}

export interface ResolvableOptions<T> extends InjectableOptions {
    readonly for?: Injectable<T>;
}
