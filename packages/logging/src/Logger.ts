import { defineInjectable } from '@nzyme/ioc';

export type LoggerArgs = {
    [key: string]: unknown;
};

export interface Logger {
    error(error: unknown, args?: LoggerArgs): void;
    error(message: string, args?: LoggerArgs): void;
    warn(message: string, args?: LoggerArgs): void;
    info(message: string, args?: LoggerArgs): void;
    success(message: string, args?: LoggerArgs): void;
    debug(message: string, args?: LoggerArgs): void;
    trace(message: string, args?: LoggerArgs): void;
    measure(start: number, message: string): void;
}

export const Logger = defineInjectable<Logger>({
    name: 'Logger',
});
