import type { SchemaAny } from '../Schema.js';
import type { Extend } from './extend.js';

declare class ForceName {}
export type Nullable<S extends SchemaAny> = Extend<S, { nullable: true }> & ForceName;

export function nullable<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        nullable: true,
    } as Nullable<S>;
}
