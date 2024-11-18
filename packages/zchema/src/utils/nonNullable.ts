import type { SchemaAny } from '../Schema.js';
import type { Extend } from './extend.js';

declare class ForceName {}
export type NonNullable<S extends SchemaAny> = Extend<S, { nullable: false }> & ForceName;

export function nonNullable<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        nullable: false,
    } as NonNullable<S>;
}
