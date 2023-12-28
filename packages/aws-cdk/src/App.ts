import { diffTemplate, formatDifferences } from '@aws-cdk/cloudformation-diff';
import {
    CloudFormationStackArtifact as CloudFormationStackArtifactLegacy,
    AssetManifestArtifact as AssetManifestArtifactLegacy,
} from '@aws-cdk/cx-api';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';
import { Deployments } from 'aws-cdk/lib/api/deployments.js';
import * as cdk from 'aws-cdk-lib/core';
import {
    AssetManifestArtifact,
    CloudFormationStackArtifact,
    CloudAssembly,
} from 'aws-cdk-lib/cx-api';
import chalk from 'chalk';
import consola from 'consola';

import { perf } from '@nzyme/logging';
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
        const artifacts = this.getStackArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            const stackName = artifact.stackName;
            const stack = this.stacks.find(stack => stack.stackName === stackName);
            const start = perf.start();

            // Publish stack assets first
            for (const dep of artifact.dependencies) {
                if (dep instanceof AssetManifestArtifact) {
                    await this.deployments.publishAssets(
                        dep as unknown as AssetManifestArtifactLegacy,
                        {
                            stack: artifact as unknown as CloudFormationStackArtifactLegacy,
                            stackName,
                        },
                    );
                }
            }

            consola.info(`Deploying stack ${chalk.green(stackName)}`);
            stack?.$.emit('deploy:start');

            const deployment = await this.deployments.deployStack({
                stack: artifact as unknown as CloudFormationStackArtifactLegacy,
                deployName: artifact.stackName,
            });

            consola.success(
                `Successfully deployed stack ${chalk.green(stackName)} in ${chalk.green(
                    perf.format(start),
                )}}`,
            );
            stack?.$.emit('deploy:finished', deployment);
        }
    }

    public async destroy(params: AppStackParams = {}) {
        const cloudAssembly = this.synth();
        const artifacts = this.getStackArtifacts(params, cloudAssembly);

        // Destroy stacks in reverse order.
        for (const artifact of arrayReverse(artifacts)) {
            const stackName = artifact.stackName;
            const stack = this.stacks.find(stack => stack.stackName === stackName);

            consola.info(`Destroying stack ${chalk.green(stackName)}`);
            stack?.$.emit('destroy:start');

            await this.deployments.destroyStack({
                stack: artifact as unknown as CloudFormationStackArtifactLegacy,
                deployName: artifact.stackName,
            });

            consola.success(`Successfully destroyed stack ${chalk.green(stackName)}`);
            stack?.$.emit('destroy:finished');
        }
    }

    public async diff(params: AppStackParams = {}) {
        await this.build();

        const cloudAssembly = this.synth();
        const artifacts = this.getStackArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            const currentTemplate = await this.deployments.readCurrentTemplateWithNestedStacks(
                artifact as unknown as CloudFormationStackArtifactLegacy,
            );

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const diff = diffTemplate(currentTemplate.deployedTemplate, artifact.template);

            if (diff.isEmpty) {
                consola.success(`No changes detected for stack ${chalk.green(artifact.stackName)}`);
            } else {
                consola.info(`Changes for stack ${chalk.green(artifact.stackName)}:\n`);
                formatDifferences(process.stdout, diff);
            }
        }
    }

    private getStackArtifacts(params: AppStackParams, cloudAssembly: CloudAssembly) {
        if (!params.stacks) {
            return mapNotNull(cloudAssembly.artifacts, artifact => {
                if (artifact instanceof CloudFormationStackArtifact) {
                    return artifact;
                }

                return null;
            });
        }

        const selectedStacks = Array.isArray(params.stacks)
            ? params.stacks
            : this.stacks.filter(params.stacks);

        const selectedStackArtifacts = mapNotNull(cloudAssembly.artifacts, artifact => {
            if (
                artifact instanceof CloudFormationStackArtifact &&
                selectedStacks.some(s => s.stackName === artifact.stackName)
            ) {
                return artifact;
            }

            return null;
        });

        selectedStackArtifacts.sort((a, b) => {
            if (a.dependencies.includes(b)) {
                return 1;
            }

            if (b.dependencies.includes(a)) {
                return -1;
            }

            return 0;
        });

        const artifacts: CloudFormationStackArtifact[] = [];

        for (const artifact of selectedStackArtifacts) {
            for (const dep of artifact.dependencies) {
                if (!(dep instanceof CloudFormationStackArtifact)) {
                    continue;
                }

                // Skip if already included.
                if (artifacts.includes(dep)) {
                    continue;
                }

                // Skip if the dependency is not in the list of selected stacks.
                if (
                    this.stacks.some(s => s.stackName === dep.stackName) &&
                    !selectedStacks.some(s => s.stackName === dep.stackName)
                ) {
                    continue;
                }

                artifacts.push(dep);
            }

            // Skip if already included.
            if (artifacts.includes(artifact)) {
                continue;
            }

            artifacts.push(artifact);
        }

        return artifacts;
    }
}
