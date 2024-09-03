import type { Plugin } from 'rollup';

export function dotenvPlugin(vars: Record<string, string | number | boolean>): Plugin {
    return {
        name: 'dotenv',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: '.env',
                source: Object.entries(vars)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('\n'),
            });
        },
    };
}
