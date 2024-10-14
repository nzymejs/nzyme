export function randomInt(min: number = 0, max: number = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (max - min)) + min;
}
