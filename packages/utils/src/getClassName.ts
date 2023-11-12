import { AbstractConstructor } from '@nzyme/types';

export function getClassName(obj: object) {
    if (typeof obj.constructor === 'function') {
        return obj.constructor.name;
    }

    const proto = Object.getPrototypeOf(obj) as {
        constructor: AbstractConstructor | undefined;
    };

    return proto.constructor?.name;
}
