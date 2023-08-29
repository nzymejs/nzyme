export function splitIntoChunks<T>(array: readonly T[], chunkSize: number) {
    if (chunkSize < 1) {
        throw new Error('Chunk must be greater than 0');
    }

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }

    return result;
}
