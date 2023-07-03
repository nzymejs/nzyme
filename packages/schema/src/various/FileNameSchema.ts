import { FILENAME_REGEX } from '@nzyme/validation';

import { SchemaPrimitiveConfig } from '../SchemaPrimitive.js';
import { StringSchema } from '../StringSchema.js';

export type FileNameSchemaConfig<TNullable extends boolean> = SchemaPrimitiveConfig<
    string,
    TNullable
>;

export class FileNameSchema<TNullable extends boolean = false> extends StringSchema<TNullable> {
    constructor(config: FileNameSchemaConfig<TNullable> = {}) {
        super({
            ...config,
            regex: FILENAME_REGEX,
            nonEmpty: true,
        });
    }
}
