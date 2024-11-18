import type { Override, PartialOnUndefined } from '@nzyme/types';

import type { SchemaAny, SchemaOptions, SchemaValue } from '../Schema.js';

declare class ForceName {}
export type Extend<S extends SchemaAny, O> = PartialOnUndefined<Override<S, O>> & ForceName;

export function extend<S extends SchemaAny, O>(
    schema: S,
    options: O & SchemaOptions<SchemaValue<S>>,
) {
    const merged = {
        ...schema,
        ...options,
    };

    return merged as unknown as Extend<S, O>;
}
