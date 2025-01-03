import type { Override, PartialOnUndefined } from '@nzyme/types';

import type { Schema, SchemaOptions, Infer } from '../Schema.js';

declare class ForceName {}
export type Extend<S extends Schema, O> = PartialOnUndefined<Override<S, O>> & ForceName;

export function extend<S extends Schema, O>(schema: S, options: O & SchemaOptions<Infer<S>>) {
    const merged = {
        ...schema,
        ...options,
    };

    return merged as unknown as Extend<S, O>;
}
