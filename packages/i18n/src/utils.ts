import { formatWith } from '@nzyme/utils';

import type { Translatable } from './Translatable.js';

export interface TranslateArgs {
    locale?: string;
    params?: Record<string, unknown>;
}

export function translate(value: Translatable, args?: TranslateArgs) {
    const params = args?.params;
    const message = typeof value === 'string' ? value : value(args?.locale);
    if (params) {
        return formatWith(message, params);
    }

    return message;
}
