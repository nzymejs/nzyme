import { randomInt as randomIntCrypto } from 'node:crypto';

export function randomInt(min: number = 0, max: number = Number.MAX_SAFE_INTEGER) {
    return randomIntCrypto(min, max);
}
