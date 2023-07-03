import { SchemaError } from './SchemaError.js';
import { Typed, TypedAny, WithType } from './Typed.js';

export function toGetter<T>(getter: T | (() => T)) {
    return typeof getter === 'function' ? (getter as () => T) : () => getter;
}

export function getTypeName(value: unknown) {
    if (value == null || typeof value !== 'object' || value instanceof Array) {
        return null;
    }

    return (value as Partial<Typed>).__typename || null;
}

export function assertTypeName(type: string | undefined | null): asserts type is string;
export function assertTypeName<TType extends string>(
    type: string | undefined | null,
    expected: TType,
): asserts type is TType;

export function assertTypeName<TType extends string>(
    type: string | undefined | null,
    expected?: TType,
): void {
    if (type == null) {
        if (expected) {
            throw new SchemaError(`No typename provided. Expected '${expected}'`);
        } else {
            throw new SchemaError(`No typename provided`);
        }
    }

    if (expected && expected !== type) {
        throw new SchemaError(`Incorrect type '${type}'. Expected '${expected}'`);
    }
}

export function wrapWithType<T extends object, TType extends string>(value: T, type: TType) {
    const typed = value as WithType<T, TType>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typed.__typename = type as any;
    return typed;
}

export function makeTyped<T extends Typed = TypedAny>(type: string): T {
    return { __typename: type } as T;
}
