import { defineFactory } from '@nzyme/ioc';

import { Logger, LoggerArgs } from './Logger.js';
import { perf } from './perf.js';

export class ConsoleLogger implements Logger {
    constructor(private readonly name: string = '') {}

    public error(error: unknown, args?: LoggerArgs): void;
    public error(message: string, args?: LoggerArgs): void;
    public error(message: string | unknown, args?: LoggerArgs): void {
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

    private format(message: string) {
        return this.name ? `${this.name}: ${message}` : message;
    }
}

export const ConsoleLoggerFactory = defineFactory({
    name: 'ConsoleLogger',
    for: Logger,
    setup({ scope }) {
        return new ConsoleLogger(scope?.name);
    },
});
