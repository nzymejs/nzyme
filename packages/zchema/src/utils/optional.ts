import type { Override } from '@nzyme/types';

import type { SchemaAny } from '../Schema.js';

declare class ForceName {}
export type Optional<S extends SchemaAny> = Override<S, { optional: true }> & ForceName;

export function optional<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        optional: true,
    } as Optional<S>;
}
