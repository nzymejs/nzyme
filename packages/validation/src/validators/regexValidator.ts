import { Translatable } from '@nzyme/i18n';

import translations from './translations.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';
import { Validator } from '../validator.js';

export function regexValidator(regex: RegExp, message?: Translatable): Validator<string> {
    return (value: string) => {
        if (!regex.test(value)) {
            return regexError(message);
        }
    };
}

export function regexError(message?: Translatable) {
    return createError({
        code: CommonErrors.InvalidValue,
        message: message ?? translations.get('InvalidFormat'),
    });
}
