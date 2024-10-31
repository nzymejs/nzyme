import {
    mergeErrors,
    normalizeErrors,
    ValidationError,
    type ValidationContext,
    type ValidationErrors,
    type ValidationResult,
} from '@nzyme/validate';

import { SCHEMA_PROTO, type SchemaAny, type SchemaProto, type SchemaValue } from '../Schema.js';

export function validate<S extends SchemaAny>(
    schema: S,
    value: SchemaValue<S>,
    ctx: ValidationContext = {},
) {
    const errors = validateInner(schema, value, ctx);
    return normalizeErrors(errors);
}

export function validateOrThrow<S extends SchemaAny>(
    schema: S,
    value: SchemaValue<S>,
    ctx: ValidationContext = {},
) {
    const result = validate(schema, value, ctx);
    if (result != null) {
        throw new ValidationError(result);
    }
}

function validateInner<S extends SchemaAny>(
    schema: S,
    value: SchemaValue<S>,
    ctx: ValidationContext,
): ValidationResult {
    const proto = schema[SCHEMA_PROTO] as SchemaProto<SchemaValue<S>>;

    if (value === null) {
        if (!schema.nullable) {
            return ['Invalid value'];
        }
    } else if (value === undefined) {
        if (!schema.optional) {
            return ['Invalid value'];
        }
    } else if (!proto.check(value)) {
        return ['Invalid value'];
    }

    let errors: ValidationErrors | undefined;

    proto.visit?.(value, (schema, value, key) => {
        const result = validateInner(schema, value, ctx);

        if (!result) {
            return;
        }

        if (errors === undefined) {
            errors = {};
        }

        mergeErrors(errors, result, key);
    });

    for (const validator of schema.validators) {
        const result = validator(value, ctx);
        if (result != null) {
            if (errors === undefined) {
                errors = {};
            }

            mergeErrors(errors, result);

            break;
        }
    }

    return errors;
}
