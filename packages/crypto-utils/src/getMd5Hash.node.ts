import type { BinaryLike } from 'crypto';
import { createHash } from 'crypto';

export function getMd5Hash(data: BinaryLike): string {
    return createHash('md5').update(data).digest('hex');
}
