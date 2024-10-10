export function parseBigint(value: string): bigint | null {
    try {
        return BigInt(value);
    } catch (e) {
        return null;
    }
}
