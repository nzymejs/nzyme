import { ValidationErrors } from '@nzyme/validation';

import { JsonObjectSchema } from './JsonObjectSchema.js';

export const ValidationErrorsSchema = new JsonObjectSchema<ValidationErrors, true>({
    //name: 'ValidationErrors',
    name: 'Object containing validation errors',
    nullable: true,
});
