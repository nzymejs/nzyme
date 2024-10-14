import type { XmlElement } from '@nzyme/xml-utils';
import { xmlStringify } from '@nzyme/xml-utils';

import type { FetchRequest } from './fetchRequest.js';

export interface EndpointXmlRequest extends Omit<FetchRequest, 'body'> {
    body?: XmlElement;
}

export function xmlRequest(request: EndpointXmlRequest): FetchRequest {
    if (!request.body) {
        return request as FetchRequest;
    }

    return {
        ...request,
        headers: {
            ...request.headers,
            'Content-Type': 'text/xml',
        },
        body: xmlStringify(request.body),
    };
}
