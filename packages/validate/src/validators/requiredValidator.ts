import type { ValidationContext, Validator } from '../Validator.js';

export type RequiredValidatorParams<T> = {
    message?: (params: ValidationContext & { value: T | null | undefined }) => string;
};

export function requiredValidator<T>(
    params?: RequiredValidatorParams<T>,
): Validator<T | null | undefined> {
    const message = params && params.message;

    return (value, ctx) => {
        if (value != null && value !== '' && value !== false) {
            return;
        }

        if (message) {
            return message({ ...ctx, value });
        }

        return 'Pole jest wymagane';
    };
}
