import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import type { RollupOptions } from 'rollup';

import { unwrapCjsDefaultImport } from '@nzyme/esm';

export type DevServerConfigOptions = {
    input: string;
    outputDir: string;
};

export function devServerConfig(options: DevServerConfigOptions): RollupOptions {
    return {
        input: options.input,
        output: {
            format: 'esm',
            dir: options.outputDir,
            sourcemap: true,
        },
        plugins: [
            nodeResolve({
                preferBuiltins: true,
                extensions: ['.js', '.mjs', '.ts', '.tsx', '.json'],
                exportConditions: ['node', 'module', 'import', 'require'],
            }),
            unwrapCjsDefaultImport(commonjs)(),
            unwrapCjsDefaultImport(json)(),
            unwrapCjsDefaultImport(typescript)(),
        ],
        external: source => {
            if (/^node:/.test(source) || /^[\w_-]+$/.test(source)) {
                // Node built-in modules and third party modules
                return true;
            }

            if (/node_modules/.test(source)) {
                return true;
            }

            return false;
        },
    };
}
