import type { AbstractConstructor } from '@nzyme/types';

export function getBaseClass(ctor: AbstractConstructor) {
    const proto = Object.getPrototypeOf(ctor.prototype) as {
        constructor: AbstractConstructor | undefined;
    };

    return proto.constructor;
}
