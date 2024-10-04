import type { Override } from '@nzyme/types';

import {
    SCHEMA_FACTORY,
    SCHEMA_OPTIONS,
    type SchemaAny,
    type SchemaOptions,
    type SchemaValue,
} from './Schema.js';

declare class ForceName {}
export type Extend<S extends SchemaAny, O> = Override<S, O> & ForceName;

export function extend<S extends SchemaAny, O>(
    schema: S,
    options: O & SchemaOptions<SchemaValue<S>>,
) {
    const currentOptions = schema[SCHEMA_OPTIONS] as SchemaOptions<SchemaValue<S>>;
    const mergedOptions = {
        ...currentOptions,
        ...options,
    };

    return schema[SCHEMA_FACTORY](mergedOptions) as unknown as Extend<S, O>;
}
