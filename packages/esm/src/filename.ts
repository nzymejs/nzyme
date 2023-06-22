import { fileURLToPath } from 'url';

/**
 * Replacement for __filename in ESM context.
 * @example const __filename = filename(import.meta);
 */
export function filename(meta: ImportMeta) {
    return fileURLToPath(meta.url);
}
