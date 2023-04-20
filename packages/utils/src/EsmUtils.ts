export function unwrapCjsDefaultImport<T>(value: { default: T }) {
    return value as T;
}
