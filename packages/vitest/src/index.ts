import 'vitest';

interface CustomMatchers<T = unknown> {
    toEqualFully: (expected: T) => void;
    toEqualPartially: <E>(expected: E) => void;
}

declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
