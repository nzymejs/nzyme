import type { expectToEqualFully } from './matchers/expectToEqualFully.js';
import type { expectToEqualPartially } from './matchers/expectToEqualPartially.js';

type Matcher<F> = F extends (this: void, ...args: infer A) => unknown
    ? (expected: A[1]) => void
    : never;

interface CustomMatchers<T> {
    toEqualFully: Matcher<typeof expectToEqualFully<T>>;
    toEqualPartially: Matcher<typeof expectToEqualPartially<T>>;
}

declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends CustomMatchers<T> {}
}
