import { diffTemplate, formatDifferences } from '@aws-cdk/cloudformation-diff';
import * as cdk from '@aws-cdk/core';
import { CloudFormationStackArtifact, CloudArtifact, CloudAssembly } from '@aws-cdk/cx-api';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';
import { Deployments } from 'aws-cdk/lib/api/deployments.js';
import chalk from 'chalk';
import consola from 'consola';

import { arrayReverse, mapNotNull } from '@nzyme/utils';

import { Stack } from './Stack.js';

export interface AppOptions {
    readonly sdkProvider: SdkProvider;
}

export interface AppStackParams {
    stacks?: cdk.Stack[] | ((stack: cdk.Stack) => boolean);
}

export interface AppBootstrapOptions {
    region?: string;
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
    public async bootstrap(options: AppBootstrapOptions = {}) {
        const bootstrapper = new Bootstrapper({
            source: 'default',
        });

        const region = options.region ?? this.sdkProvider.defaultRegion;
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
            // if (!stackMatches(stack, params)) {
            //     continue;
            // }

            await stack.$.execute();
        }
    }

    public async deploy(params: AppStackParams = {}) {
        await this.build(params);

        const cloudAssembly = this.synth();
        const artifacts = this.filterArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stackName = artifact.stackName;
                const stack = this.stacks.find(stack => stack.stackName === stackName);

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
        const artifacts = this.filterArtifacts(params, cloudAssembly);

        // Destroy stacks in reverse order.
        for (const artifact of arrayReverse(artifacts)) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const stackName = artifact.stackName;
                const stack = this.stacks.find(stack => stack.stackName === stackName);

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
        const artifacts = this.filterArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            if (artifact instanceof CloudFormationStackArtifact) {
                const currentTemplate =
                    await this.deployments.readCurrentTemplateWithNestedStacks(artifact);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    private filterArtifacts(params: AppStackParams, cloudAssembly: CloudAssembly) {
        if (!params.stacks) {
            return cloudAssembly.artifacts;
        }

        const filteredStacks = Array.isArray(params.stacks)
            ? params.stacks
            : this.stacks.filter(params.stacks);

        const filteredStackArtifacts = mapNotNull(filteredStacks, stack =>
            cloudAssembly.artifacts.find(
                a => a instanceof CloudFormationStackArtifact && a.stackName === stack.stackName,
            ),
        );

        // These are stacks that are created automatically and are dependencies of some stacks.
        const additionalStackArtifacts = cloudAssembly.artifacts.filter(
            artifact =>
                artifact instanceof CloudFormationStackArtifact &&
                this.stacks.every(s => s.stackName !== artifact.stackName),
        );

        // Include any additional stacks that are dependencies of the filtered stacks.
        for (const artifact of filteredStackArtifacts) {
            for (const dep of artifact.dependencies) {
                if (additionalStackArtifacts.includes(dep)) {
                    filteredStackArtifacts.push(dep);
                }
            }
        }

        return this.sortArtifactDependencies(filteredStackArtifacts);
    }

    private sortArtifactDependencies(artifacts: CloudArtifact[]) {
        artifacts = [...artifacts];
        const sorted: CloudArtifact[] = [];

        let lastLength = artifacts.length;

        while (artifacts.length > 0) {
            for (let i = 0; i < artifacts.length; i++) {
                const artifact = artifacts[i];
                if (
                    artifact.dependencies.length === 0 ||
                    artifact.dependencies.every(
                        dep => sorted.includes(dep) || !artifacts.includes(dep),
                    )
                ) {
                    sorted.push(artifact);
                    artifacts.splice(i, 1);
                    i--;
                }
            }

            if (artifacts.length === lastLength) {
                throw new Error(
                    'Could not sort artifacts, possibly there are circular dependencies.',
                );
            }

            lastLength = artifacts.length;
        }

        return sorted;
    }
}
