import type { ValidationErrorsResult } from './types.js';

export interface ValidationContext {}

export type ValidatorResult = ValidationErrorsResult | null | void | undefined;

export interface Validator<T> {
    (value: T, ctx: ValidationContext): ValidatorResult;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineValidator<T>(validator: Validator<T>) {
    return validator;
}
