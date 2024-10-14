import type { Override } from '@nzyme/types';

import type { SchemaAny } from '../Schema.js';

declare class ForceName {}
export type Nullable<S extends SchemaAny> = Override<S, { nullable: true }> & ForceName;

export function nullable<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        nullable: true,
    } as Nullable<S>;
}
