import type { ValidationErrors } from './types.js';

export interface ValidationContext {}

export type ValidatorResult = ValidationErrors | null | void | undefined;

export interface Validator<T> {
    (value: T, ctx: ValidationContext): ValidatorResult | Promise<ValidatorResult>;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineValidator<T>(validator: Validator<T>) {
    return validator;
}
