import type { EffectScope } from 'vue';
import { effectScope, getCurrentScope } from 'vue';

import type { Injectable, Resolvable } from '@nzyme/ioc';
import { Container } from '@nzyme/ioc';

export class VueContainer extends Container {
    public readonly scope: EffectScope;

    constructor(parent?: VueContainer) {
        super(parent);

        if (parent) {
            this.scope = getCurrentScope() ?? parent.scope;
        } else {
            this.scope = effectScope(true);
        }
    }

    public override createChild() {
        return new VueContainer(this);
    }

    protected override doResolve<T>(
        resolvable: Resolvable<T>,
        scope?: Injectable<unknown>,
    ): T | undefined {
        const current = getCurrentScope();

        if (current === this.scope) {
            return resolvable.resolve(this, scope);
        }

        return this.scope.run(() => {
            return resolvable.resolve(this, scope);
        });
    }
}
