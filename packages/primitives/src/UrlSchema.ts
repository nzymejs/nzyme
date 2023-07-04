import { SchemaPrimitiveConfig, StringSchema } from '@nzyme/schema';
import { regexValidator } from '@nzyme/validation';

import translations from './translations.js';

const URL_REGEX =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const URL_VALIDATOR = regexValidator(URL_REGEX, translations.get('Url_Invalid'));

export type UrlSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<string, TNullable>;

export class UrlSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: UrlSchemaConfig<TNullable> = {}) {
        super({
            name: translations.get('Url'),
            nonEmpty: true,
            ...config,
        });

        this.addValidator(URL_VALIDATOR);
    }
}
