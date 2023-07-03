import translations from '../translations/index.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';
import { Validator } from '../validator.js';

export interface MaxValidatorOptions {
    maxValue: number;
    exclusive?: boolean;
}

export function max(options: MaxValidatorOptions): Validator<number> {
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
