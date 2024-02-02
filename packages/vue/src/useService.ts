import { effectScope } from 'vue';

import type { Injectable } from '@nzyme/ioc';

import { useContainer } from './useContainer.js';

const scope = effectScope(true);

export function useService<T>(service: Injectable<T>): T {
    const container = useContainer();
    return scope.run(() => container.resolve(service)) as T;
}
