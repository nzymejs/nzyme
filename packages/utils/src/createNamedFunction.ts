export function createNamedFunction<F extends (...args: any[]) => any>(name: string, body: F): F {
    return {
        [name](...args: any[]) {
            return body.apply(this, args);
        },
    }[name] as F;
}
