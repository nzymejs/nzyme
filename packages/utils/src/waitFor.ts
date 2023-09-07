export function waitFor(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** @deprecated use @see waitFor */
export function timeout(ms: number) {
    return waitFor(ms);
}
