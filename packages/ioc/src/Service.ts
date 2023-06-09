import { EmptyObject } from '@nzyme/types';

import { ResolveDeps, ResolveResult } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';
import { Resolvable } from './Resolvable.js';

export class Service<T, TDeps extends ResolveDeps = ResolveDeps> extends Resolvable<T, TDeps> {
    constructor(private readonly def: ServiceOptions<T, TDeps>) {
        super(def);
    }

    public override get cached() {
        return true;
    }

    override resolve(deps: ResolveResult): T {
        return this.def.setup(deps as ResolveResult<TDeps>);
    }

    public create(deps: ResolveResult<TDeps>): T {
        return this.def.setup(deps);
    }
}

export interface ServiceOptions<T, TDeps extends ResolveDeps = EmptyObject>
    extends InjectableOptions {
    readonly deps?: TDeps;
    readonly for?: Injectable<T>;
    readonly setup: (deps: ResolveResult<TDeps>) => T;
}

export function defineService<T, TDeps extends ResolveDeps = EmptyObject>(
    definition: ServiceOptions<T, TDeps>,
): Service<T, TDeps> {
    return new Service(definition);
}
