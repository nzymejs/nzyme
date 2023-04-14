export interface Cancelable {
    cancel(): void;
}

export type CancelablePromise<T> = Promise<T> & Cancelable;

export function makePromiseCancelable<T>(promise: Promise<T>, cancelCallback: () => void) {
    const cancelable = promise as CancelablePromise<T>;
    cancelable.cancel = cancelCallback;
    return cancelable;
}

export function isCancelablePromise<T>(promise: Promise<T>): promise is CancelablePromise<T> {
    return 'cancel' in promise;
}
