import type { Translatable } from '@nzyme/i18n';

export interface ValidationError {
    code?: string;
    params?: Record<string, unknown>;
    message?: Translatable;
}

export type ValidationErrorsMap = {
    [key: string | number]: ValidationErrors | undefined;
};

export type ValidationErrors = ValidationError[] | ValidationErrorsMap;

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
    public readonly errors: ValidationErrors;

    constructor(message: string);
    constructor(message: string, errors: ValidationErrors);
    constructor(errors: ValidationErrors);
    constructor(messageOrErrors: string | ValidationErrors, errors?: ValidationErrors) {
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
