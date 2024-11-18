import { defineService } from '@nzyme/ioc';

import type { LoggerArgs, LoggerErrorArgs } from './Logger.js';
import { Logger } from './Logger.js';
import { perf } from './perf.js';

export class ConsoleLogger implements Logger {
    constructor(public readonly name: string = '') {}

    public error(error: unknown, args?: LoggerArgs): void;
    public error(message: string, args?: LoggerErrorArgs): void;
    public error(message: unknown, args?: LoggerArgs): void {
        if (typeof message === 'string') {
            console.error(this.format(message), args);
        } else {
            console.error(this.name, message, args);
        }
    }

    public warn(message: string, args?: LoggerArgs): void {
        if (args) {
            console.warn(this.format(message), args);
        } else {
            console.warn(this.format(message));
        }
    }

    public info(message: string, args?: LoggerArgs): void {
        if (args) {
            console.info(this.format(message), args);
        } else {
            console.info(this.format(message));
        }
    }

    public success(message: string, args?: LoggerArgs): void {
        if (args) {
            console.info(this.format(message), args);
        } else {
            console.info(this.format(message));
        }
    }

    public debug(message: string, args?: LoggerArgs): void {
        if (args) {
            console.debug(this.format(message), args);
        } else {
            console.debug(this.format(message));
        }
    }

    public trace(message: string, args?: LoggerArgs): void {
        if (args) {
            console.trace(this.format(message), args);
        } else {
            console.trace(this.format(message));
        }
    }

    public measure(start: number, message: string) {
        const time = perf.format(start);
        const formatted = `${message}: ${time}`;
        this.info(formatted);
    }

    public context<T extends Record<string, unknown>>(
        name: string,
        ctx: T | null | undefined,
    ): void {
        const displayName = this.name ? `${this.name}:${name}` : name;
        console.info(`[CTX] ${displayName}`, ctx);
    }

    protected format(message: string) {
        return this.name ? `${this.name}: ${message}` : message;
    }
}

export const ConsoleLoggerFactory = defineService({
    name: 'ConsoleLogger',
    for: Logger,
    resolution: 'transient',
    setup({ source }) {
        return new ConsoleLogger(source?.name);
    },
});
