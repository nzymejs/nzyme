import { SchemaPrimitiveConfig, StringSchema } from '@nzyme/schema';
import { regexValidator } from '@nzyme/validation';

import translations from './translations.js';

const FILENAME_REGEX = /^[^<>:;,?"*|/]+$/;
const FILENAME_VALIDATOR = regexValidator(FILENAME_REGEX, translations.get('FileName_Invalid'));

export type FileNameSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<
    string,
    TNullable
>;

export class FileNameSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: FileNameSchemaConfig<TNullable> = {}) {
        super({
            name: translations.get('FileName'),
            nonEmpty: true,
            ...config,
        });

        this.addValidator(FILENAME_VALIDATOR);
    }
}
