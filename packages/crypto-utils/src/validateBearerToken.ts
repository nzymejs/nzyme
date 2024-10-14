import { parseBearerToken } from './parseBearerToken.js';
import { stringEqualTimingSafe } from './stringEqualsTimingSafe.js';

type BasicAuthParams = {
    tokenProvided: string | null | undefined;
    tokenRequested: string;
};

export function validateBearerToken(params: BasicAuthParams) {
    let token = params.tokenProvided;
    if (!token) {
        return false;
    }

    token = parseBearerToken(token);

    return stringEqualTimingSafe(token, params.tokenRequested);
}
