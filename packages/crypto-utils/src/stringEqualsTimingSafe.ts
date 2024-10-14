import { timingSafeEqual } from 'node:crypto';

/**
 * Compare two strings using a timing safe method.
 * This method is resistant to timing attacks.
 */
export function stringEqualTimingSafe(a: string, b: string) {
    try {
        return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    } catch {
        return false;
    }
}
