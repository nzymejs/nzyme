import type { OmitProps } from '@nzyme/types';

import type { FetchRequest } from './fetchRequest.js';

export interface EndpointJsonRequest<T = unknown> extends OmitProps<FetchRequest, 'body'> {
    body?: T;
}

export function jsonRequest<T>(request: EndpointJsonRequest<T>): FetchRequest {
    if (!request.body) {
        return request as FetchRequest;
    }

    return {
        ...request,
        headers: {
            ...request.headers,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.body),
    };
}
