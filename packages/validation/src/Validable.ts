import { asArray } from '@nzyme/utils';

import type { ValidationErrors} from './types.js';
import { ValidationException } from './types.js';
import { validateWithMany } from './utils.js';
import type { ValidationContext, Validator,ValidatorResult  } from './validator.js';

export interface ValidableConfig<T> {
    validate?: Validator<T> | readonly Validator<T>[];
}

export abstract class Validable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly validators: Validator<any>[];

    constructor(config: ValidableConfig<T>) {
        this.validators = asArray(config.validate || []);
    }

    public async validate(
        value: unknown,
        ctx: ValidationContext = {},
    ): Promise<ValidationErrors | null> {
        const result = (
            (await this.preValidate(value, ctx)) ??
            (await this.runValidators(value as T, ctx)) ??
            (await this.postValidate(value as T, ctx))
        );

        return result || null;
    }

    protected preValidate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ctx: ValidationContext,
    ): Promise<ValidatorResult> | ValidatorResult {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postValidate(
        value: T,
        ctx: ValidationContext,
    ): Promise<ValidatorResult> | ValidatorResult {
        return null;
    }

    protected runValidators(value: T, ctx: ValidationContext) {
        return validateWithMany(value, this.validators, ctx);
    }

    public addValidator(validator: Validator<T>) {
        this.validators.push(validator);
    }

    public async validateAndThrow(value: unknown, ctx?: ValidationContext): Promise<void> {
        const validation = await this.validate(value, ctx);
        if (validation) {
            throw new ValidationException(validation);
        }
    }
}
