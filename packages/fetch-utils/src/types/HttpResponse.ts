import type { HttpResponseHeaders } from './HttpHeaders.js';

export interface HttpResponse {
    status: number;
    statusText?: string;
    body?: string | Blob;
    headers: HttpResponseHeaders;
}
