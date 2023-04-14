export function cachedProp(target: any, methodName: string, descriptor: PropertyDescriptor) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const get = descriptor.get;
    if (!get) {
        return;
    }

    const symbol = Symbol();

    descriptor.get = function (this: any) {
        const cache = this[symbol];
        if (cache) {
            return cache;
        }

        return (this[symbol] = get.apply(this));
    };
}
