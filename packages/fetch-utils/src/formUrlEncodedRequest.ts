import type { OmitProps } from '@nzyme/types';

import type { FetchRequest } from './fetchRequest.js';

export interface EndpointFormUrlEncodedRequest<T = unknown>
    extends OmitProps<FetchRequest, 'body'> {
    body?: T;
}

export function formUrlEncodedRequest<T>(request: EndpointFormUrlEncodedRequest<T>): FetchRequest {
    if (!request.body) {
        return request as FetchRequest;
    }

    return {
        url: request.url,
        method: request.method,
        query: request.query,
        headers: {
            ...request.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(request.body),
    };
}
