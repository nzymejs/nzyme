import type { ValidationResult } from './ValidationResult.js';

export class ValidationError extends Error {
    public readonly errors: ValidationResult;

    constructor(message: string);
    constructor(message: string, errors: ValidationResult);
    constructor(errors: ValidationResult);
    constructor(messageOrErrors: string | ValidationResult, errors?: ValidationResult) {
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
