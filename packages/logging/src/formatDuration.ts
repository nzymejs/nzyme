export function formatDuration(ms: number) {
    if (ms < 1000) {
        return `${ms.toFixed(1)}ms`;
    }

    const seconds = ms / 1000;
    return `${seconds.toFixed(3)}s`;
}
