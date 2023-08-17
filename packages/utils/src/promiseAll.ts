type PromiseObjectResult<T> = Promise<{
    [K in keyof T]: T[K] extends Promise<infer V> ? V : T[K];
}>;

export async function promiseAll<T>(promises: T) {
    const result: Record<string, unknown> = {};

    for (const key in promises) {
        const promise = promises[key] as Promise<unknown>;
        result[key] = await promise;
    }

    return result as unknown as PromiseObjectResult<T>;
}
