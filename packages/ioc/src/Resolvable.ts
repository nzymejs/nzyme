import { Container } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';

export abstract class Resolvable<T = unknown> extends Injectable<T> {
    public readonly for?: Injectable<T>;

    constructor(def: ResolvableOptions<T>) {
        super(def);
        this.for = def.for;
    }

    public abstract get cached(): boolean;
    public abstract resolve(container: Container, scope?: Injectable): T | undefined;
}

export interface ResolvableOptions<T> extends InjectableOptions {
    readonly for?: Injectable<T>;
}
