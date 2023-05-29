import { diffTemplate, formatDifferences } from '@aws-cdk/cloudformation-diff';
import * as cdk from '@aws-cdk/core';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments.js';
import chalk from 'chalk';
import consola from 'consola';

import { arrayReverse } from '@nzyme/utils';

import { Stack } from './Stack.js';

export interface AppOptions {
    readonly sdkProvider: SdkProvider;
}

export class App extends cdk.App {
    private readonly sdkProvider: SdkProvider;
    private readonly cloudFormation: CloudFormationDeployments;

    constructor(options: AppOptions) {
        super();
        this.sdkProvider = options.sdkProvider;
        this.cloudFormation = new CloudFormationDeployments({ sdkProvider: this.sdkProvider });
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

        for (const stack of this.stacks) {
            if (!stack.node.children.length) {
                // Don't deploy the stack if it's empty
                continue;
            }

            const stackName = stack.stackName;
            const region = stack.region ?? this.sdkProvider.defaultRegion;

            consola.info(`Deploying stack ${chalk.green(stackName)} to ${chalk.green(region)}`);
            stack.$.emit('deploy:start');

            const deployment = await this.cloudFormation.deployStack({
                stack: cloudAssembly.getStackByName(stackName),
            });

            consola.success(`Successfully deployed stack ${chalk.green(stackName)}`);
            stack.$.emit('deploy:finished', deployment);

            return deployment;
        }
    }

    public async destroy() {
        const cloudAssembly = this.synth();

        // Destroy stacks in reverse order.
        for (const stack of arrayReverse(this.stacks)) {
            const stackName = stack.stackName;
            const region = stack.region ?? this.sdkProvider.defaultRegion;

            consola.info(`Destroying stack ${chalk.green(stackName)} in ${chalk.green(region)}`);
            stack.$.emit('destroy:start');

            await this.cloudFormation.destroyStack({
                stack: cloudAssembly.getStackByName(stackName),
            });

            consola.success(`Successfully destroyed stack ${chalk.green(stackName)}`);
            stack.$.emit('destroy:finished');
        }
    }

    public async diff() {
        await this.build();

        const cloudAssembly = this.synth();

        for (const stack of this.stacks) {
            const stackArtifact = cloudAssembly.getStackByName(stack.stackName);
            const currentTemplate = await this.cloudFormation.readCurrentTemplateWithNestedStacks(
                stackArtifact,
            );

            const diff = diffTemplate(currentTemplate, stackArtifact.template);

            if (diff.isEmpty) {
                consola.success(`No changes detected for stack ${chalk.green(stack.stackName)}`);
            } else {
                consola.info(`Changes for stack ${chalk.green(stack.stackName)}:\n`);
                formatDifferences(process.stdout, diff);
            }
        }
    }
}
