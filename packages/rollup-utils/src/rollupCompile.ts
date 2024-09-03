import chalk from 'chalk';
import consola from 'consola';
import { emptyDir } from 'fs-extra/esm';
import { rollup } from 'rollup';

import { perf } from '@nzyme/logging';

import type { RollupOptions } from './types.js';

export async function rollupCompile(options: RollupOptions) {
    const start = perf.start();

    if (options.output.dir) {
        await emptyDir(options.output.dir);
    }

    const result = await rollup(options);

    await result.write(options.output);
    await result.close();

    consola.success(`Compiled in ${chalk.green(perf.format(start))}`);
}
