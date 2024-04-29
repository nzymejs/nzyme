import { effectScope } from 'vue';

import type { Injectable } from '@nzyme/ioc';
import { createMemo } from '@nzyme/utils';

import { useContainer } from './useContainer.js';

const scope = effectScope(true);

export function useService<T>(service: Injectable<T>): T {
    const container = useContainer();
    return scope.run(() => container.resolve(service)) as T;
}

export function useServiceLazy<T>(service: Injectable<T>): () => T {
    const container = useContainer();
    const memo = createMemo(() => scope.run(() => container.resolve(service)) as T);

    return memo;
}
