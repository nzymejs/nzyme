import type { Container } from './Container.js';
import type { Injectable } from './Injectable.js';
import { Resolvable, type ResolvableOptions } from './Resolvable.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFunction<P extends any[] = any[], R = unknown> = (...params: P) => R;

export class Command<T extends CommandFunction> extends Resolvable<T> {
    constructor(private readonly def: CommandDefinition<T>) {
        super(def);
    }

    public override get cached() {
        return true;
    }

    public override resolve(container: Container): T {
        let cmd: T | undefined;

        return ((...params: Parameters<T>) => {
            if (!cmd) {
                cmd = this.def.setup({
                    container,
                    inject: injectable => container.resolve(injectable),
                });
            }

            return cmd(...params) as ReturnType<T>;
        }) as T;
    }
}

export interface CommandContext {
    readonly container: Container;
    readonly inject: <T>(injectable: Injectable<T>) => T;
}

export interface CommandDefinition<T extends CommandFunction> extends ResolvableOptions<T> {
    readonly setup: (ctx: CommandContext) => T;
}

export function defineCommand<T extends CommandFunction>(
    definition: CommandDefinition<T>,
): Command<T> {
    return new Command(definition);
}
