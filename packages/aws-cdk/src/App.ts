import { diffTemplate, formatDifferences } from '@aws-cdk/cloudformation-diff';
import * as cdk from '@aws-cdk/core';
import { CloudFormationStackArtifact } from '@aws-cdk/cx-api';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';
import { Deployments } from 'aws-cdk/lib/api/deployments.js';
import chalk from 'chalk';
import consola from 'consola';

import { arrayReverse } from '@nzyme/utils';

import { Stack } from './Stack.js';

export interface AppOptions {
    readonly sdkProvider: SdkProvider;
}

export interface AppStackParams {
    stacks?: cdk.Stack[] | ((stack: cdk.Stack) => boolean);
}

export class App extends cdk.App {
    private readonly sdkProvider: SdkProvider;
    private readonly deployments: Deployments;

    constructor(options: AppOptions) {
        super();
        this.sdkProvider = options.sdkProvider;
        this.deployments = new Deployments({ sdkProvider: this.sdkProvider });
    }

    public get stacks() {
        return this.node.children.filter(child => child instanceof Stack) as Stack[];
    }

    /**
     * Bootstrapping environment is required for stacks using cross-region resources, like CloudFront.
     */
    public async bootstrap() {
        const bootstrapper = new Bootstrapper({
            source: 'default',
        });

        const region = this.sdkProvider.defaultRegion;
        const account = (await this.sdkProvider.defaultAccount())?.accountId;
        if (!account) {
            throw new Error('No AWS account detected.');
        }

        return await bootstrapper.bootstrapEnvironment(
            {
                name: '',
                region,
                account,
            },
            this.sdkProvider,
        );
    }

    public async build(params: AppStackParams = {}) {
        for (const stack of this.stacks) {
            if (!stackMatches(stack, params)) {
                continue;
            }

            await stack.$.execute();
        }
    }

    public async deploy(params: AppStackParams = {}) {
        await this.build(params);

        const cloudAssembly = this.synth();

        for (const artifact of cloudAssembly.artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stackName = artifact.stackName;
                const stack = this.stacks.find(stack => stack.stackName === stackName);

                if (stack && !stackMatches(stack, params)) {
                    continue;
                }

                consola.info(`Deploying stack ${chalk.green(stackName)}`);
                stack?.$.emit('deploy:start');

                const deployment = await this.deployments.deployStack({
                    stack: artifact,
                    deployName: artifact.stackName,
                });

                consola.success(`Successfully deployed stack ${chalk.green(stackName)}`);
                stack?.$.emit('deploy:finished', deployment);
            }
        }
    }

    public async destroy(params: AppStackParams = {}) {
        const cloudAssembly = this.synth();

        // Destroy stacks in reverse order.
        for (const artifact of arrayReverse(cloudAssembly.artifacts)) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stackName = artifact.stackName;
                const stack = this.stacks.find(stack => stack.stackName === stackName);

                if (stack && !stackMatches(stack, params)) {
                    continue;
                }

                consola.info(`Destroying stack ${chalk.green(stackName)}`);
                stack?.$.emit('destroy:start');

                await this.deployments.destroyStack({
                    stack: artifact,
                    deployName: artifact.stackName,
                });

                consola.success(`Successfully destroyed stack ${chalk.green(stackName)}`);
                stack?.$.emit('destroy:finished');
            }
        }
    }

    public async diff(params: AppStackParams = {}) {
        await this.build();

        const cloudAssembly = this.synth();

        for (const artifact of cloudAssembly.artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stackName = artifact.stackName;
                const stack = this.stacks.find(stack => stack.stackName === stackName);

                if (stack && !stackMatches(stack, params)) {
                    continue;
                }

                const currentTemplate = await this.deployments.readCurrentTemplateWithNestedStacks(
                    artifact,
                );

                const diff = diffTemplate(currentTemplate, artifact.template);

                if (diff.isEmpty) {
                    consola.success(
                        `No changes detected for stack ${chalk.green(artifact.stackName)}`,
                    );
                } else {
                    consola.info(`Changes for stack ${chalk.green(artifact.stackName)}:\n`);
                    formatDifferences(process.stdout, diff);
                }
            }
        }
    }
}

function stackMatches(stack: cdk.Stack, params: AppStackParams) {
    if (!params.stacks) {
        return true;
    }

    if (Array.isArray(params.stacks)) {
        return params.stacks.includes(stack);
    }

    return params.stacks(stack);
}
