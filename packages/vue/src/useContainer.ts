import { inject } from 'vue';

import type { Container } from '@nzyme/ioc';

export const containerSymbol = Symbol('container');

export function useContainer() {
    const container = inject(containerSymbol) as Container;
    if (!container) {
        throw new Error('Container not registered. Register CommonPlugin first');
    }

    return container;
}
