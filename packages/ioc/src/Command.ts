import type { EmptyObject } from '@nzyme/types';
import { createMemo } from '@nzyme/utils';

import type { ContainerScope } from './ContainerScope.js';
import type { Interface } from './Interface.js';
import {
    defineService,
    type Service,
    type ServiceConstructor,
    type ServiceDependencies,
    type ServiceOptions,
} from './Service.js';
import { singletonStrategy, type ServiceResolutionParams } from './serviceResolve.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFunction<P extends any[] = any[], R = unknown> = (...params: P) => R;

export interface CommandOptions<T extends CommandFunction, TExtend extends T = T> {
    readonly implements?: Interface<T>;
    readonly scope?: ContainerScope;
    readonly setup: ServiceConstructor<TExtend>;
}

export type Command<T extends CommandFunction = CommandFunction> = Service<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandResult<T extends Command<any>> =
    T extends Command<infer R> ? Awaited<ReturnType<R>> : never;

/*#__NO_SIDE_EFFECTS__*/
export function defineCommand<
    T extends CommandFunction,
    TExtend extends T = T,
    TDeps extends ServiceDependencies = EmptyObject,
>(options: ServiceOptions<T, TExtend, TDeps>) {
    return defineService<T, TExtend, TDeps>({
        ...options,
        resolution: commandStrategy,
    });
}

function commandStrategy(params: ServiceResolutionParams) {
    const memo = createMemo(() => singletonStrategy(params) as CommandFunction);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const command: CommandFunction = (...args) => memo()(...args);

    return command;
}
