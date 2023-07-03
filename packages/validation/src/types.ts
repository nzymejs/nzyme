import { Translatable } from '@nzyme/i18n';

export interface ValidationError {
    code: string;
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
    constructor(public readonly errors: ValidationErrors) {
        super('Validation failed');
    }
}
