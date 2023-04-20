import { EmptyObject } from '@nzyme/types';

import { ResolveDeps } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';

export abstract class Resolvable<
    T = unknown,
    TDeps extends ResolveDeps = ResolveDeps,
> extends Injectable<T> {
    public readonly for?: Injectable<T>;
    public readonly deps: TDeps;

    constructor(def: ResolvableOptions<T, TDeps>) {
        super(def);
        this.for = def.for;
        this.deps = def.deps ?? ({} as TDeps);
    }

    public abstract get cached(): boolean;
    public abstract resolve(deps: TDeps, scope?: Injectable): T | undefined;
}

export interface ResolvableOptions<T, TDeps extends ResolveDeps = EmptyObject>
    extends InjectableOptions {
    readonly deps?: TDeps;
    readonly for?: Injectable<T>;
}
