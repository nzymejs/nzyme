import { XMLBuilder } from 'fast-xml-parser';

import type { XmlElement } from './xmlTypes.js';

const builder = new XMLBuilder({
    format: true,
    indentBy: '  ',
    attributesGroupName: '_attributes',
});

export function xmlStringify<T = XmlElement>(xml: T) {
    const xmlString = builder.build(xml) as string;
    return '<?xml version="1.0" encoding="utf-8" ?>\n' + xmlString;
}
