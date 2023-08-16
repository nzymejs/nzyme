import { Container } from './Container.js';
import { Injectable, InjectableOptions } from './Injectable.js';
import { Resolvable } from './Resolvable.js';

export class Executable<T> extends Resolvable<() => T> {
    constructor(private readonly def: ExecutableDefinition<T>) {
        super(def);
    }

    public override get cached() {
        return true;
    }

    public override resolve(container: Container) {
        return () =>
            this.def.setup({
                container,
                inject: injectable => container.resolve(injectable),
            });
    }
}

export interface ExecutableContext {
    readonly container: Container;
    readonly inject: <T>(injectable: Injectable<T>) => T;
}

export interface ExecutableDefinition<T> extends InjectableOptions {
    readonly setup: (ctx: ExecutableContext) => T;
}

export function defineExecutable<T>(definition: ExecutableDefinition<T>): Executable<T> {
    return new Executable(definition);
}
