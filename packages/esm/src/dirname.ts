import { fileURLToPath } from 'url';

/**
 * Replacement for __dirname in ESM context.
 * @example const __dirname = dirname(import.meta);
 */
export function dirname(meta: ImportMeta) {
    return fileURLToPath(new URL('.', meta.url));
}
