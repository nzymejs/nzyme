export function debounceAsyncFunction<T>(fn: () => Promise<T>) {
    let pending: Promise<T> | undefined;

    return () => {
        if (pending) {
            return pending;
        }

        pending = fn().finally(() => {
            pending = undefined;
        });

        return pending;
    };
}
