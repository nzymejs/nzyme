import { EmptyObject } from '@nzyme/types';

import { ResolveDeps, ResolveResult } from './Container.js';
import { Injectable } from './Injectable.js';
import { Resolvable, ResolvableOptions } from './Resolvable.js';

export class Factory<T, TDeps extends ResolveDeps = ResolveDeps> extends Resolvable<T, TDeps> {
    constructor(private readonly def: FactoryOptions<T, TDeps>) {
        super(def);
    }

    public override get cached() {
        return false;
    }

    override resolve(deps: ResolveResult, scope?: Injectable): T {
        return this.def.setup(deps as ResolveResult<TDeps>, scope);
    }

    public create(deps: ResolveResult<TDeps>): T {
        return this.def.setup(deps);
    }
}

export interface FactoryOptions<T, TDeps extends ResolveDeps = EmptyObject>
    extends ResolvableOptions<T, TDeps> {
    readonly setup: (deps: ResolveResult<TDeps>, scope?: Injectable) => T;
}

export function defineFactory<T, TDeps extends ResolveDeps = EmptyObject>(
    definition: FactoryOptions<T, TDeps>,
): Factory<T, TDeps> {
    return new Factory(definition);
}
