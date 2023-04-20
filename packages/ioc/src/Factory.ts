import { ResolveDeps, ResolveResult } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';
import { Resolvable } from './Resolvable.js';

export class Factory<T, TDeps extends ResolveDeps = ResolveDeps> extends Resolvable<T, TDeps> {
    constructor(private readonly def: FactoryDefinition<T, TDeps>) {
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

export interface FactoryDefinition<T, TDeps extends ResolveDeps = {}> extends InjectableOptions {
    readonly deps?: TDeps;
    readonly for?: Injectable<T>;
    readonly setup: (deps: ResolveResult<TDeps>, scope?: Injectable) => T;
}

export function defineFactory<T, TDeps extends ResolveDeps = {}>(
    definition: FactoryDefinition<T, TDeps>,
): Factory<T, TDeps> {
    return new Factory(definition);
}
