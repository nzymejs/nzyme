export interface CacheOptions<TArg, TValue> {
    cacheKey: (arg: TArg) => string | number;
    getValue: (arg: TArg) => TValue;
}

export function createCache<TArg, TValue>(options: CacheOptions<TArg, TValue>) {
    const cache = new Map<string | number, TValue | undefined>();
    const { cacheKey, getValue } = options;

    return {
        get,
        set,
    };

    function get(arg: TArg) {
        const key = cacheKey(arg);
        let value = cache.get(key);

        if (value === undefined) {
            value = getValue(arg);
            cache.set(key, value);
        }

        return value;
    }

    function set(arg: TArg, value: TValue) {
        const key = cacheKey(arg);
        cache.set(key, value);
    }
}
