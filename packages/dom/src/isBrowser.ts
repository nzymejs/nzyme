/**
 * Returns if we are in a browser context.
 * Convenient for mixed SSR/CSR code.
 */
export function isBrowser() {
    return typeof window === 'object';
}
