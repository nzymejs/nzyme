import { inject, type InjectionKey } from 'vue';

import type { Container } from '@nzyme/ioc';

export const containerSymbol = Symbol('container') as InjectionKey<Container>;

export function useContainer() {
    const container = inject(containerSymbol);
    if (!container) {
        throw new Error('Container not registered. Register CommonPlugin first');
    }

    return container;
}
