import { equals } from '@jest/expect-utils';
import { printDiffOrStringify } from 'jest-matcher-utils';

type ExpectedPartial<T> = T extends unknown[] ? Partial<T[number]>[] : Partial<T>;

export function expectToEqualPartially<T>(received: T, expected: ExpectedPartial<T>) {
    const expectedResult: unknown = Array.isArray(expected)
        ? expected.map(x => expect.objectContaining(x) as unknown)
        : expect.objectContaining(expected);

    const pass = equals(received, expectedResult);

    expect;

    return {
        message: () => printDiffOrStringify(expectedResult, received, 'Expected', 'Received', true),
        pass,
    };
}
