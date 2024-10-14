import { getBigintMostSignificantBit } from './getBigintMostSignificantBit.js';

test('most significant bit', () => {
    const testCases = [
        { value: BigInt(0), expected: 0n },
        { value: BigInt(1), expected: 1n },
        { value: BigInt(2), expected: 2n },
        { value: BigInt(3), expected: 2n },
        { value: BigInt(4), expected: 3n },
        { value: BigInt(1056), expected: 11n },
        { value: BigInt(2234213), expected: 22n },
        { value: BigInt(2234213123123123), expected: 51n },
    ];

    for (const { value, expected } of testCases) {
        expect(getBigintMostSignificantBit(value)).toBe(expected);
    }
});
