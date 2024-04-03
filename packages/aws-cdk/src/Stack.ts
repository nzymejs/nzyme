import type { DeployStackResult } from 'aws-cdk/lib/api';
import * as cdk from 'aws-cdk-lib/core';

import { createEventEmitter } from '@nzyme/utils';

import type { App } from './App.js';

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

    public deployResult: DeployStackResult | undefined;

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
        emitAsync: this.eventEmitter.emitAsync,
    };
}
