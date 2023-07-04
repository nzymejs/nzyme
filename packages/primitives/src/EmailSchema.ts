import { SchemaPrimitiveConfig, StringSchema } from '@nzyme/schema';
import { regexValidator } from '@nzyme/validation';

import translations from './translations.js';

const EMAIL_REGEX =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const EMAIL_VALIDATOR = regexValidator(EMAIL_REGEX, translations.get('EmailAddress_Invalid'));

export type EmailSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<string, TNullable>;

export class EmailSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: EmailSchemaConfig<TNullable> = {}) {
        super({
            name: translations.get('EmailAddress'),
            nonEmpty: true,
            ...config,
        });

        this.addValidator(EMAIL_VALIDATOR);
    }
}
