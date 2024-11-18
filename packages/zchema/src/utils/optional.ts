import type { SchemaAny } from '../Schema.js';
import type { Extend } from './extend.js';

declare class ForceName {}
export type Optional<S extends SchemaAny> = Extend<S, { optional: true }> & ForceName;

export function optional<S extends SchemaAny>(schema: S) {
    return {
        ...schema,
        optional: true,
    } as Optional<S>;
}
