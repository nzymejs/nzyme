import translations from './translations.js';
import { CommonErrors } from '../types.js';
import { createError } from '../utils.js';
import type { Validator } from '../validator.js';

export interface MinValidatorOptions {
    minValue: number;
    exclusive?: boolean;
}

export function minValidator(options: MinValidatorOptions): Validator<number> {
    const minValue = options.minValue;
    const exclusive = options.exclusive;

    return value => {
        const valid = exclusive ? value > minValue : value >= minValue;
        if (valid) {
            return;
        }

        const params = {
            value: minValue,
        };

        return createError({
            code: CommonErrors.MinValue,
            message: translations.get('MinValue'),
            params: params,
        });
    };
}
