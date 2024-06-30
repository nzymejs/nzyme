export type Memo<T> = {
    (): T;
    clear: () => void;
    value: () => T | undefined;
};

export function createMemo<T>(factory: () => T) {
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

    memo.value = () => value;

    return memo;
}

export type MemoAsync<T> = {
    (): Promise<T>;
    clear: () => void;
    promise: () => Promise<T> | undefined;
    value: () => T | undefined;
};

export function createMemoAsync<T>(factory: () => Promise<T>) {
    let promise: Promise<T> | undefined;
    let value: T | undefined;

    const memo: MemoAsync<T> = (() => {
        if (!promise) {
            promise = factory().then(result => {
                value = result;
                return result;
            });
        }

        return promise;
    }) as MemoAsync<T>;

    memo.clear = () => {
        promise = undefined;
        value = undefined;
    };

    memo.promise = () => promise;
    memo.value = () => value;

    return memo;
}
