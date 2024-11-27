import type { QueryObject } from 'ufo';
import { withQuery } from 'ufo';

import { FetchError } from './FetchError.js';

interface BaseRequest {
    url: string;
    query?: QueryObject;
    headers?: Record<string, string>;
}

interface SimpleRequest extends BaseRequest {
    method?: 'GET' | 'HEAD' | 'DELETE';
    data?: never;
}

interface DataRequest extends BaseRequest {
    method: 'POST' | 'PUT' | 'PATCH';
    data?: unknown;
}

export async function fetchJson<T>(request: SimpleRequest | DataRequest) {
    const headers: Record<string, string> = { ...request.headers };
    let url = request.url;
    if (request.query) {
        url = withQuery(url, request.query);
    }

    const requestInit: RequestInit = {
        method: request.method || 'GET',
        headers: headers,
    };

    if (request.data) {
        headers['Content-Type'] = 'application/json';
        requestInit.body = JSON.stringify(request.data);
    }

    const response = await fetch(url, requestInit);
    if (!response.ok) {
        throw new FetchError(response);
    }

    if (response.status === 204) {
        return null;
    }

    return (await response.json()) as T;
}
