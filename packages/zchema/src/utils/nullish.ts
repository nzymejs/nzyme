import type { SchemaAny } from '../Schema.js';
import type { Extend } from './extend.js';

declare class ForceName {}
export type Nullish<S extends SchemaAny> = Extend<S, { nullable: true; optional: true }> &
    ForceName;

export function nullish<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        nullable: true,
        optional: true,
    } as Nullish<S>;
}
