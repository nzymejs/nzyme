import { ResolveDeps, ResolveResult } from './Container.js';
import { InjectableOptions } from './Injectable.js';
import { Resolvable } from './Resolvable.js';

export class Executable<T, TDeps extends ResolveDeps> extends Resolvable<() => T, TDeps> {
    constructor(private readonly def: ExecutableDefinition<T, TDeps>) {
        super(def);
    }

    public override get cached() {
        return true;
    }

    override resolve(deps: ResolveResult): () => T {
        return () => this.def.setup(deps as ResolveResult<TDeps>);
    }

    public execute(deps: ResolveResult<TDeps>): void {
        this.def.setup(deps);
    }
}

export interface ExecutableDefinition<T, TDeps extends ResolveDeps = ResolveDeps>
    extends InjectableOptions {
    readonly deps: TDeps;
    readonly setup: (deps: ResolveResult<TDeps>) => T;
}

export function defineExecutable<T, TDeps extends ResolveDeps>(
    definition: ExecutableDefinition<T, TDeps>,
): Executable<T, TDeps> {
    return new Executable(definition);
}
