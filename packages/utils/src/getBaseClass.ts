import { AbstractConstructor } from '@nzyme/types';

export function getBaseClass(ctor: AbstractConstructor) {
    return Object.getPrototypeOf(ctor.prototype).constructor as AbstractConstructor | undefined;
}
