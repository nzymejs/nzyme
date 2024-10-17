import { fullDiff, formatDifferences } from '@aws-cdk/cloudformation-diff';
import type { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';
import { Deployments } from 'aws-cdk/lib/api/deployments.js';
import { StackActivityProgress } from 'aws-cdk/lib/api/util/cloudformation/stack-activity-monitor.js';
import type { ResourcesToImport } from 'aws-cdk/lib/api/util/cloudformation.js';
import * as cdk from 'aws-cdk-lib/core';
import type { CloudAssembly } from 'aws-cdk-lib/cx-api';
import { AssetManifestArtifact, CloudFormationStackArtifact } from 'aws-cdk-lib/cx-api';
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
    recursive?: boolean;
}

export interface AppDeployParams extends AppStackParams {
    import?: boolean;
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
        return this.node.children.filter(child => child instanceof Stack);
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

    public async deploy(params: AppDeployParams = {}) {
        const cloudAssembly = this.synth();
        const artifacts = this.getStackArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            const stackName = artifact.stackName;
            const stack = this.stacks.find(stack => stack.stackName === stackName);
            const start = perf.start();

            // Publish stack assets first
            for (const dep of artifact.dependencies) {
                if (dep instanceof AssetManifestArtifact) {
                    await this.deployments.publishAssets(dep as unknown as any, {
                        stack: artifact as any,
                        stackName,
                    });
                }
            }

            consola.info(`Deploying stack ${chalk.green(stackName)}`);
            if (stack instanceof Stack) {
                await stack.$.emitAsync('deploy:start');
            }

            const deployment = await this.deployments.deployStack({
                stack: artifact as any,
                deployName: artifact.stackName,
                resourcesToImport: params.import
                    ? await this.getResourcesToImport(artifact)
                    : undefined,
                progress: StackActivityProgress.EVENTS,
            });

            consola.success(
                `Successfully deployed stack ${chalk.green(stackName)} in ${chalk.green(
                    perf.format(start),
                )}`,
                deployment.outputs,
            );
            if (stack instanceof Stack) {
                await stack?.$.emitAsync('deploy:finished', deployment);
            }
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
            if (stack instanceof Stack) {
                await stack.$.emitAsync('destroy:start');
            }

            await this.deployments.destroyStack({
                stack: artifact as any,
                deployName: artifact.stackName,
            });

            consola.success(`Successfully destroyed stack ${chalk.green(stackName)}`);
            if (stack instanceof Stack) {
                await stack.$.emitAsync('destroy:finished');
            }
        }
    }

    public async diff(params: AppStackParams = {}) {
        const cloudAssembly = this.synth();
        const artifacts = this.getStackArtifacts(params, cloudAssembly);

        for (const artifact of artifacts) {
            const currentTemplate = await this.deployments.readCurrentTemplateWithNestedStacks(
                artifact as any,
            );

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const diff = fullDiff(currentTemplate.deployedRootTemplate, artifact.template);

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
                    !params.recursive &&
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

    private async getResourcesToImport(artifact: CloudFormationStackArtifact) {
        const currentTemplate = await this.deployments.readCurrentTemplateWithNestedStacks(
            artifact as any,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const diff = fullDiff(currentTemplate.deployedRootTemplate, artifact.template);

        const toImport: ResourcesToImport = [];

        for (const id of diff.resources.logicalIds) {
            const resource = diff.resources.get(id);
            if (resource.isAddition) {
                const identifier = this.getResourceIdentifier(
                    resource.resourceType!,
                    resource.newProperties || {},
                );
                if (identifier) {
                    toImport.push({
                        LogicalResourceId: id,
                        ResourceType: resource.resourceType!,
                        ResourceIdentifier: identifier,
                    });
                }
            }
        }

        return toImport;
    }

    private getResourceIdentifier(type: string, props: Record<string, unknown>) {
        switch (type) {
            case 'AWS::DynamoDB::Table':
                return { TableName: props.TableName as string };
        }
    }
}
