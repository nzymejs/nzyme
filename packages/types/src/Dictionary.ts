export type Dictionary<TValue, TKey extends string | number = string | number> = {
    [P in TKey]+?: TValue;
};
