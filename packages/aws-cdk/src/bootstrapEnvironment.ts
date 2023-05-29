import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap/index.js';

interface BootstrapEnvironmentParams {
    sdkProvider: SdkProvider;
    name: string;
    region?: string;
    account?: string;
}

/**
 * Bootstrapping environment is required for stacks using cross-region resources, like CloudFront.
 */
export async function bootstrapEnvironment(params: BootstrapEnvironmentParams) {
    const bootstrapper = new Bootstrapper({
        source: 'default',
    });

    const name = params.name;
    const region = params.region ?? params.sdkProvider.defaultRegion;
    const account = params.account ?? (await params.sdkProvider.defaultAccount())?.accountId;
    if (!account) {
        throw new Error('No AWS account detected.');
    }

    return await bootstrapper.bootstrapEnvironment({ name, region, account }, params.sdkProvider);
}
