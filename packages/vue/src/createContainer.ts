import type { EffectScope } from 'vue';
import { effectScope as createEffectScope, getCurrentScope } from 'vue';

import { createContainer as createContainerBase, type Container } from '@nzyme/ioc';

export type VueContainer = Container & {
    effectScope: EffectScope;
};

export type VueContainerOptions = {
    parent?: VueContainer;
};

export function createContainer(options?: VueContainerOptions) {
    const parent = options?.parent;
    const effectScope = parent
        ? (getCurrentScope() ?? parent.effectScope)
        : createEffectScope(true);

    const container = createContainerBase({
        parent,
        child: () => createContainer({ parent: container }),
        resolve: (resolvable, scope) => {
            const current = getCurrentScope();

            if (current === effectScope) {
                return resolvable.resolve(container, scope);
            }

            return effectScope.run(() => {
                return resolvable.resolve(container, scope);
            });
        },
    }) as VueContainer;

    container.effectScope = effectScope;

    return container;
}
