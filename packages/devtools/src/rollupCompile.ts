import chalk from 'chalk';
import consola from 'consola';
import { rollup } from 'rollup';

import { perf } from '@nzyme/logging';

import { getRollupOptions, type RollupOptions } from './getRollupOptions.js';

export async function rollupCompile(options: RollupOptions) {
    const start = perf.start();

    const rollupOptions = getRollupOptions(options);
    const result = await rollup(rollupOptions.input);

    await result.write(rollupOptions.output);
    await result.close();

    consola.success(`Compiled in ${chalk.green(perf.format(start))}`);
}
