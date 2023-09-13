import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { DeployStackResult } from 'aws-cdk/lib/api';

import { createEventEmitter } from '@nzyme/utils';

import { App } from './App.js';

export interface StackOptions {
    readonly name: string;
    readonly description?: string;
    readonly env?: cdk.Environment;
}

export interface StackEvents {
    'deploy:start': void;
    'deploy:finished': DeployStackResult;
    'destroy:start': void;
    'destroy:finished': void;
}

export type StackHandler = () => Promise<void>;

export class Stack extends cdk.Stack {
    private readonly eventEmitter = createEventEmitter<StackEvents>();
    private readonly tasks: StackHandler[] = [];

    private deployResult: DeployStackResult | undefined;

    constructor(
        app: App,
        public readonly options: StackOptions,
    ) {
        super(app, options.name, {
            env: options.env,
            description: options.description,
        });

        this.on('deploy:start', () => {
            this.deployResult = undefined;
        });

        this.on('deploy:finished', result => {
            this.deployResult = result;
        });
    }

    public readonly on = this.eventEmitter.on;

    /** Internal */
    public readonly $ = {
        emit: this.eventEmitter.emit,
        execute: async () => {
            for (const task of this.tasks) {
                await task();
            }
        },
    };

    public enqueue(handler: StackHandler) {
        this.tasks.push(handler);
    }

    public createExport(name: string, value: string) {
        if (!/^\w+$/.test(name)) {
            throw new Error('Export name can only contain letters and numbers.');
        }

        const output = new CfnOutput(this, name, {
            value,
        });

        return () => {
            if (this.deployResult) {
                return this.deployResult.outputs[name];
            }

            return cdk.Fn.importValue(output.importValue);
        };
    }
}
