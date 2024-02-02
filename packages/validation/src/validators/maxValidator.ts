import translations from './translations.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';
import type { Validator } from '../validator.js';

export interface MaxValidatorOptions {
    maxValue: number;
    exclusive?: boolean;
}

export function maxValidator(options: MaxValidatorOptions): Validator<number> {
    const maxValue = options.maxValue;
    const exclusive = options.exclusive;

    return value => {
        const valid = exclusive ? value < maxValue : value <= maxValue;
        if (valid) {
            return;
        }

        const params = { maxValue };

        return createError({
            code: CommonErrors.MaxValue,
            message: translations.get('MaxValue'),
            params,
        });
    };
}
