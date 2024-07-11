import { equals } from '@jest/expect-utils';
import { printDiffOrStringify } from 'jest-matcher-utils';

export function expectToEqualFully<T>(received: T, expected: T) {
    const pass = equals(received, expected);

    return {
        message: () => printDiffOrStringify(expected, received, 'Expected', 'Received', true),
        pass,
    };
}
