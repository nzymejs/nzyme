export type Memo<T> = {
    (): T;
    clear(): void;
    current(): T | undefined;
};

export function createMemo<T>(factory: () => T): Memo<T> {
    let valueSet: boolean = false;
    let value: T | undefined;

    const memo: Memo<T> = (() => {
        if (!valueSet) {
            value = factory();
            valueSet = true;
        }

        return value;
    }) as Memo<T>;

    memo.clear = () => {
        value = undefined;
        valueSet = false;
    };

    memo.current = () => value;

    return memo;
}
