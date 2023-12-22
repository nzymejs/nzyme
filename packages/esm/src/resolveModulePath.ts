import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function resolveModulePath(path: string): string {
    return require.resolve(path);
}
