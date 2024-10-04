export interface ValidationContext {
    lang?: string;
}

export interface ValidationErrors {
    [key: string]: string[] | undefined;
}

export type ValidationResult = ValidationErrors | string[] | string | null | void | undefined;

export interface Validator<T> {
    (value: T, ctx: ValidationContext): ValidationResult;
}
