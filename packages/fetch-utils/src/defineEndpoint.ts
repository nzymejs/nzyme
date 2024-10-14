import type { FetchRequest } from './fetchRequest.js';

export interface Endpoint<TParams, TResult> {
    request: (params: TParams) => FetchRequest;
    response?: (response: Response, params: TParams) => Promise<TResult>;
}

export interface EndpointResponse<T> {
    (response: Response): Promise<T>;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineEndpoint<TParams = void, TResult = void>(
    endpoint: Endpoint<TParams, TResult>,
) {
    return endpoint;
}
