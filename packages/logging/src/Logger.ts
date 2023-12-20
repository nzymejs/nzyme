import { defineInjectable } from '@nzyme/ioc';

export type LoggerArgs = {
    [key: string]: unknown;
};

export type LoggerErrorArgs = {
    error?: unknown;
    [key: string]: unknown;
};

export interface Logger {
    error(message: string, args?: LoggerErrorArgs): void;
    error(error: unknown, args?: LoggerArgs): void;
    warn(message: string, args?: LoggerArgs): void;
    info(message: string, args?: LoggerArgs): void;
    success(message: string, args?: LoggerArgs): void;
    debug(message: string, args?: LoggerArgs): void;
    trace(message: string, args?: LoggerArgs): void;
    measure(start: number, message: string): void;
    context<T extends Record<string, any>>(name: string, ctx: T | null | undefined): void;
}

export const Logger = defineInjectable<Logger>({
    name: 'Logger',
});
