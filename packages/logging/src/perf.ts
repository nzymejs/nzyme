import { formatDuration } from './formatDuration.js';

export const perf = {
    start,
    duration,
    format,
};

function start() {
    return performance.now();
}

function duration(start: number) {
    return performance.now() - start;
}

function format(start: number) {
    const ms = duration(start);
    return formatDuration(ms);
}
