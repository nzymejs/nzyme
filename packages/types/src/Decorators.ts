import { AbstractConstructor } from './Constructors';

export interface PropertyDecorator<TResult = void> {
    (target: PropertyDecoratorTarget, propertyKey: string): TResult;
}

export interface PropertyDecoratorTarget {
    constructor: AbstractConstructor;
}
