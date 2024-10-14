import { joinURL } from 'ufo';

import type { Endpoint } from './defineEndpoint.js';
import type { FetchRequest } from './fetchRequest.js';
import { fetchRequest } from './fetchRequest.js';

export interface FetchEndpointParams<TParams> {
    params: TParams;
    baseUrl?: string;
    headers?: Record<string, string>;
    onRequest?: (request: FetchRequest) => void;
}

export async function fetchEndpoint<TParams, TResult>(
    endpoint: Endpoint<TParams, TResult>,
    params: FetchEndpointParams<TParams>,
): Promise<TResult> {
    let request = endpoint.request(params.params);

    request = {
        ...request,
        url: params.baseUrl ? joinURL(params.baseUrl, request.url) : request.url,
        headers: {
            ...params.headers,
            ...request.headers,
        },
    };

    params.onRequest?.(request);
    const response = await fetchRequest(request);

    if (endpoint.response) {
        return await endpoint.response(response, params.params);
    }

    return undefined as unknown as TResult;
}
