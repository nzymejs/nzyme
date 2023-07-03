import translations from '../translations/index.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';

export function requiredValidator<T>(value: T) {
    if (value == null) {
        return requiredError();
    }
}

export function requiredError() {
    return createError({
        code: CommonErrors.Required,
        message: translations.get('Required'),
    });
}
