import { EMAIL_REGEX } from '@nzyme/validation';

import { SchemaPrimitiveConfig } from '../SchemaPrimitive.js';
import { StringSchema } from '../StringSchema.js';

export type EmailSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<string, TNullable>;

export class EmailSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: EmailSchemaConfig<TNullable> = {}) {
        super({
            ...config,
            regex: EMAIL_REGEX,
            nonEmpty: true,
        });
    }
}
