import { URL_REGEX } from '@nzyme/validation';

import { SchemaPrimitiveConfig } from '../SchemaPrimitive.js';
import { StringSchema } from '../StringSchema.js';

export type UrlSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<string, TNullable>;

export class UrlSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: UrlSchemaConfig<TNullable> = {}) {
        super({
            ...config,
            regex: URL_REGEX,
            nonEmpty: true,
        });
    }
}
