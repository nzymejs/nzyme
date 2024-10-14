import type { Endpoint } from './defineEndpoint.js';

export interface FetchClient {
    <TResult>(endpoint: Endpoint<void, TResult>): Promise<TResult>;
    <TParams, TResult>(endpoint: Endpoint<TParams, TResult>, params: TParams): Promise<TResult>;
}

interface FetchClientInput {
    (endpoint: Endpoint<unknown, unknown>, params?: unknown): Promise<unknown>;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineFetchClient(client: FetchClientInput) {
    return client as FetchClient;
}
