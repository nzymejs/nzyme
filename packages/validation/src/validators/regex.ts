import translations from '../translations/index.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';
import { Validator } from '../validator.js';

export function regexValidator(regex: RegExp): Validator<string> {
    return (value: string) => {
        if (!regex.test(value)) {
            return regexError();
        }
    };
}

export function regexError() {
    return createError({
        code: CommonErrors.InvalidValue,
        message: translations.get('InvalidFormat'),
    });
}
