import { SdkProvider } from 'aws-cdk/lib/api/aws-auth/index.js';

export function getSdkProvider() {
    return SdkProvider.withAwsCliCompatibleDefaults({});
}
