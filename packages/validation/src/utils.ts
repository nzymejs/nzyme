import type { Translator } from '@nzyme/i18n';
import { translate } from '@nzyme/i18n';
import type { Maybe } from '@nzyme/types';

import type { ValidationErrorsResult, ValidationError } from './types.js';
import type { ValidationContext, Validator } from './validator.js';

export function validateWithMany<T>(
    value: T,
    validators: readonly Validator<T>[],
    ctx: ValidationContext,
) {
    for (const validator of validators) {
        const errors = validator(value, ctx);
        if (errors) {
            return errors;
        }
    }

    return null;
}

export function createError(...errors: ValidationError[]) {
    return errors;
}

export function singleError(error: ValidationError): ValidationErrorsResult {
    return { '': [error] };
}

export function getErrorForKey(errors: Maybe<ValidationErrorsResult>, key: string | number) {
    if (!errors) {
        return null;
    }

    if (Array.isArray(errors)) {
        return null;
    }

    return errors[key] || null;
}

export function* flattenErrors(errors: ValidationErrorsResult): IterableIterator<ValidationError> {
    if (Array.isArray(errors)) {
        for (const error of errors) {
            yield error;
        }
    } else {
        for (const prop in errors) {
            const err = errors[prop];
            if (!err) {
                break;
            }

            for (const error of flattenErrors(err)) {
                yield error;
            }
        }
    }
}

export function translateErrors(errors: ValidationErrorsResult): void;
export function translateErrors(errors: ValidationErrorsResult, translator: Translator): void;
export function translateErrors(errors: ValidationErrorsResult, locale: string): void;
export function translateErrors(
    errors: ValidationErrorsResult,
    localeOrTranslator?: string | Translator,
) {
    if (localeOrTranslator == null || typeof localeOrTranslator === 'string') {
        for (const error of flattenErrors(errors)) {
            if (error.message) {
                error.message = translate(error.message, {
                    locale: localeOrTranslator,
                    params: error.params,
                });
            }
        }
    } else {
        for (const error of flattenErrors(errors)) {
            if (error.message) {
                error.message = localeOrTranslator(error.message, error.params);
            }
        }
    }
}
