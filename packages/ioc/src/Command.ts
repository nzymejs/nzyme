import { createMemo } from '@nzyme/utils';

import type { ContainerScope } from './ContainerScope.js';
import type { Injectable, InjectableOptions } from './Injectable.js';
import {
    defineService,
    singletonStrategy,
    type Service,
    type ServiceOptions,
    type ServiceResolutionParams,
    type ServiceSetup,
} from './Service.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFunction<P extends any[] = any[], R = unknown> = (...params: P) => R;

export interface CommandOptions<T extends CommandFunction, TExtend extends T = T> {
    readonly for?: Injectable<T>;
    readonly scope?: ContainerScope;
    readonly setup: ServiceSetup<TExtend>;
}

export type Command<T extends CommandFunction = CommandFunction> = Service<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandResult<T extends Command<any>> =
    T extends Command<infer R> ? Awaited<ReturnType<R>> : never;

/*#__NO_SIDE_EFFECTS__*/
export function defineCommand<
    T extends CommandFunction,
    TExtend extends T = T,
    TOptions extends InjectableOptions = InjectableOptions,
>(options: ServiceOptions<T, TExtend> & TOptions) {
    return defineService<T, TExtend, TOptions>({
        ...options,
        resolution: commandStrategy,
    });
}

function commandStrategy<T extends CommandFunction>(params: ServiceResolutionParams<T>) {
    const memo = createMemo(() => singletonStrategy(params));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const command: CommandFunction = (...args) => memo()(...args);

    return command;
}
