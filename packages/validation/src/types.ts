import type { Translatable } from '@nzyme/i18n';

export interface ValidationError {
    code?: string;
    params?: Record<string, unknown>;
    message?: Translatable;
}

export type ValidationErrors = {
    [key: string | number]: ValidationError[] | ValidationErrors | undefined;
};

export type ValidationErrorsResult = ValidationError[] | ValidationErrors;

export enum CommonErrors {
    Required = 'Required',
    MinValue = 'MinValue',
    MaxValue = 'MaxValue',
    WrongType = 'WrongType',
    UnknownProperty = 'UnknownProperty',
    InvalidValue = 'InvalidValue',
    NonExisting = 'NonExisting',
}

export class ValidationException extends Error {
    public readonly errors: ValidationErrorsResult;

    constructor(message: string);
    constructor(message: string, errors: ValidationErrorsResult);
    constructor(errors: ValidationErrorsResult);
    constructor(messageOrErrors: string | ValidationErrorsResult, errors?: ValidationErrorsResult) {
        let message: string;
        if (typeof messageOrErrors === 'string') {
            message = messageOrErrors;
        } else {
            message = 'Validation failed';
            errors = messageOrErrors;
        }

        super(message, { cause: errors });
        this.errors = errors || {};
    }
}
