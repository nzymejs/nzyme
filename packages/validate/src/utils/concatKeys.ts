export function concatKeys(
    first: string | number,
    second: string | null | undefined | number,
): string {
    if (second == null || second === '') {
        return String(first);
    }

    if (first === '') {
        return String(second);
    }

    return `${first}.${second}`;
}
