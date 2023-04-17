export function asyncImport<T>(promise: Promise<{ default: T }>) {
    return promise.then(c => c.default);
}
