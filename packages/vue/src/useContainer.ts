import { getCurrentInstance, inject, provide, type InjectionKey } from 'vue';

import type { VueContainer } from './createContainer.js';

export const containerSymbol = Symbol('container') as InjectionKey<VueContainer> & symbol;

export function useContainer() {
    const instance = getCurrentInstance() as { provides?: { [key: string | symbol]: unknown } };
    let container = instance?.provides?.[containerSymbol] as VueContainer | undefined;
    if (container) {
        return container;
    }

    container = inject(containerSymbol);
    if (!container) {
        throw new Error('Container not registered. Register CommonPlugin first');
    }

    return container;
}

export function useChildContainer() {
    const container = useContainer();
    const child = container.createChild();

    provide(containerSymbol, child);

    return child;
}
