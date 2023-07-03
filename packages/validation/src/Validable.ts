import { asArray } from '@nzyme/utils';

import { ValidationErrors, ValidationException } from './types.js';
import { validateWithMany } from './utils.js';
import { ValidationContext, Validator } from './validator.js';

export interface ValidableConfig<T> {
    validate?: Validator<T> | readonly Validator<T>[];
}

export abstract class Validable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly validators: Validator<any>[];

    constructor(config: ValidableConfig<T>) {
        this.validators = asArray(config.validate || []);
    }

    public validate(value: unknown, ctx: ValidationContext = {}): ValidationErrors | null {
        return (
            this.preValidate(value, ctx) ??
            this.runValidators(value as T, ctx) ??
            this.postValidate(value as T, ctx) ??
            null
        );
    }

    protected preValidate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ctx: ValidationContext,
    ): ValidationErrors | null | undefined {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postValidate(value: T, ctx: ValidationContext): ValidationErrors | null | undefined {
        return null;
    }

    protected runValidators(value: T, ctx: ValidationContext) {
        return validateWithMany(value, this.validators, ctx);
    }

    public addValidator(validator: Validator<T>) {
        this.validators.push(validator);
    }

    public validateAndThrow(value: unknown, ctx: ValidationContext): asserts value is T {
        const validation = this.validate(value, ctx);
        if (validation) {
            throw new ValidationException(validation);
        }
    }
}
