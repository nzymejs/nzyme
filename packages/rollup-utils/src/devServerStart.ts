import chalk from 'chalk';
import connect from 'connect';
import consola from 'consola';
import type { RollupWatchOptions } from 'rollup';

import { devServerMiddleware } from './devServerMiddleware.js';

export type DevServerOptions = RollupWatchOptions & {
    port: number;
};

export function devServerStart(options: DevServerOptions) {
    const app = connect();
    const middleware = devServerMiddleware(options);

    app.use(middleware);
    app.listen(options.port, () => {
        consola.info(`Server listening on ${chalk.green(`http://localhost:${options.port}`)}`);
    });
}
