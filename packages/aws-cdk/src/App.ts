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

    public async build() {
        for (const stack of this.stacks) {
            await stack.$.execute();
        }
    }

    public async deploy() {
        await this.build();

        const cloudAssembly = this.synth();
        const stacks = this.stacks;

        for (const artifact of cloudAssembly.artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stack = stacks.find(stack => stack.stackName === artifact.stackName);
                const stackName = artifact.stackName;

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

    public async destroy() {
        const cloudAssembly = this.synth();
        const stacks = this.stacks;

        // Destroy stacks in reverse order.
        for (const artifact of arrayReverse(cloudAssembly.artifacts)) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stack = stacks.find(stack => stack.stackName === artifact.stackName);
                const stackName = artifact.stackName;

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

    public async diff() {
        await this.build();

        const cloudAssembly = this.synth();

        for (const artifact of cloudAssembly.artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
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
