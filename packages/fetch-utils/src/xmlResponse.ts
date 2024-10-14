import { xmlParse } from '@nzyme/xml-utils';

export async function xmlResponse(response: Response) {
    const xml = await response.text();
    return xmlParse(xml);
}
