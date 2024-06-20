import type { Container } from './Container.js';
import type { InjectableOptions } from './Injectable.js';
import { Injectable } from './Injectable.js';

export type ResolvableScope = 'root' | 'child';

export abstract class Resolvable<T = unknown, TExtend extends T = T> extends Injectable<TExtend> {
    public readonly for?: Injectable<T>;
    public readonly scope: ResolvableScope;

    constructor(def: ResolvableOptions<T>) {
        super(def);
        this.for = def.for;
        this.scope = def.scope ?? 'root';
    }

    public abstract get cached(): boolean;
    public abstract resolve(container: Container, scope?: Injectable): TExtend;

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
    readonly scope?: ResolvableScope;
}
