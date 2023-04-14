interface Getter<TFrom, TValue> {
    (value: TFrom): TValue;
}

export function cachedGetter<TFrom, TValue>(getter: Getter<TFrom, TValue>): Getter<TFrom, TValue> {
    const symbol = Symbol();

    return from => {
        let value = (from as any)[symbol];
        if (!value) {
            value = getter(from);
            (from as any)[symbol] = value;
        }

        return value;
    };
}
