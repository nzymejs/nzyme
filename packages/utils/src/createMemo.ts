export type Memo<T> = {
    (): T;
    clear(): void;
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

    return memo;
}
