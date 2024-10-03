import type { ValidationResult } from './ValidationResult.js';

export interface ValidationContext {
    lang?: string;
}

export interface Validator<T> {
    (value: T, ctx: ValidationContext): ValidationResult | string | null | void | undefined;
}

/*#__NO_SIDE_EFFECTS__*/
export function defineValidator<T>(validator: Validator<T>) {
    return validator;
}
