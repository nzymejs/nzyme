import path from 'node:path';
import { Worker } from 'node:worker_threads';

import chalk from 'chalk';
import consola from 'consola';
import getPort from 'get-port';
import type { Middleware } from 'koa';
import Koa from 'koa';
import koaProxy from 'koa-proxy';
import { watch, type RollupWatchOptions } from 'rollup';

import { formatDuration, perf } from '@nzyme/logging';
import { createPromise } from '@nzyme/utils';

import { onRollupWarning } from './onRollupWarning.js';

export type DevServerOptions = RollupWatchOptions & {
    port: number;
};

export function devServerStart(options: DevServerOptions) {
    const outputFile = getOutputFile(options);

    startRollup();

    let compiled = false;
    let server: ReturnType<typeof createServer> | undefined;

    const app = new Koa();

    app.use(async (ctx, next) => {
        if (!server && compiled) {
            server = createServer();
            void server.start();
        }

        if (server) {
            await server.middleware(ctx, next);
        } else {
            await next();
        }
    });

    app.listen(options.port, () => {
        consola.info(`Server listening on ${chalk.green(`http://localhost:${options.port}`)}`);
    });

    function startRollup() {
        const watcher = watch({
            onwarn: onRollupWarning,
            ...options,
        });

        watcher.on('event', event => {
            if (event.code === 'BUNDLE_START') {
                server = createServer();
            } else if (event.code === 'BUNDLE_END') {
                compiled = true;

                const duration = formatDuration(event.duration);
                consola.info(`Server compiled in ${chalk.green(duration)}.`);
                void server?.start();
            } else if (event.code === 'ERROR') {
                consola.error(event.error);
            }
        });
    }

    function createServer() {
        // Stop the current server
        void server?.stop();

        let worker: Worker | undefined;
        const proxyPromise = createPromise<Middleware>();

        const middleware: Middleware = async (ctx, next) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            await proxyPromise.promise.then(p => p(ctx, next));
        };

        return {
            middleware,
            start,
            stop,
        };

        async function start(this: unknown) {
            if (worker) {
                // already started
                return;
            }

            const start = perf.start();
            const port = await getPort();

            worker = new Worker(outputFile, {
                stderr: true,
                stdout: true,
                workerData: {
                    port,
                },
            });

            worker.stdout.pipe(process.stdout);
            worker.stderr.pipe(process.stderr);

            worker.on('error', err => {
                consola.error(err);
            });

            worker.on('exit', () => {
                if (server === this) {
                    server = undefined;
                }
            });

            const proxy = koaProxy({
                host: `http://localhost:${port}`,
            });

            worker.on('message', e => {
                if (e === 'START') {
                    consola.info(`Server started in ${chalk.green(perf.format(start))}`);
                    proxyPromise.resolve(proxy);
                }
            });
        }

        async function stop() {
            server = undefined;
            await worker?.terminate();
        }
    }
}

function getOutputFile(options: DevServerOptions) {
    if (typeof options.input !== 'string') {
        throw new Error('Input must be single file');
    }

    if (!options.output) {
        throw new Error('Output is required');
    }

    if (Array.isArray(options.output)) {
        throw new Error('Output must be single file');
    }

    if (typeof options.output.file === 'string') {
        const cwd = process.cwd();
        const outputFile = path.resolve(cwd, options.output.file);

        return outputFile;
    }

    if (typeof options.output.dir === 'string') {
        const inputExtension = path.extname(options.input);
        const inputBase = path.basename(options.input, inputExtension);
        const outputFile = path.join(options.output.dir, `${inputBase}.js`);

        return outputFile;
    }

    throw new Error('Output must be file or directory');
}
