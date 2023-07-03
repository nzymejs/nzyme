import { ValidationErrors } from './types.js';

export interface ValidationContext {
    skipUnknown?: boolean;
}

export interface Validator<T> {
    (value: T, ctx: ValidationContext): ValidationErrors | null | void | undefined;
}

export function defineValidator<T>(validator: Validator<T>) {
    return validator;
}
