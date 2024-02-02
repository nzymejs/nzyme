import { asArray } from '@nzyme/utils';

import type { Validator } from './validator.js';

type ValidatorParam<T> = Validator<T> | readonly Validator<T>[] | undefined | null;

export function mergeValidators<T>(
    first: ValidatorParam<T>,
    second: ValidatorParam<T>,
): readonly Validator<T>[] {
    if (first == null && second == null) {
        return [];
    }

    if (first == null) {
        return asArray(second!);
    }

    if (second == null) {
        return asArray(first);
    }

    const merged: Validator<T>[] = [];

    if (typeof first === 'function') {
        merged.push(first);
    } else {
        merged.push(...first);
    }

    if (typeof second === 'function') {
        merged.push(second);
    } else {
        merged.push(...second);
    }

    return merged as readonly Validator<T>[];
}
