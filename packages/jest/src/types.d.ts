import type { expectToEqualFully } from './matchers/expectToEqualFully';
import type { expectToEqualPartially } from './matchers/expectToEqualPartially';

export * from './index.js';

type Matcher<F> = F extends (this: void, ...args: infer A) => unknown
    ? (expected: A[1]) => void
    : never;

interface CustomMatchers<T> {
    toEqualFully: Matcher<typeof expectToEqualFully<T>>;
    toEqualPartially: Matcher<typeof expectToEqualPartially<T>>;
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R, T> extends CustomMatchers<T> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}
