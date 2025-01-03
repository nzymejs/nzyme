import type { SchemaAny } from '../Schema.js';
import type { Extend } from './extend.js';

declare class ForceName {}
export type NonNullish<S extends SchemaAny> = Extend<S, { nullable: false; optional: false }> &
    ForceName;

export function nonNullish<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        nullable: false,
        optional: false,
    } as NonNullish<S>;
}
