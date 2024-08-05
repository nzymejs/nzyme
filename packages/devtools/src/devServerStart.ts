import path from 'node:path';
import { Worker } from 'node:worker_threads';

import chalk from 'chalk';
import consola from 'consola';
import getPort from 'get-port';
import type { Middleware } from 'koa';
import Koa from 'koa';
import koaProxy from 'koa-proxy';
import type { InputOptions, InputPluginOption, OutputOptions, RollupWatchOptions } from 'rollup';
import { watch } from 'rollup';

import { formatDuration, perf } from '@nzyme/logging';
import { createPromise } from '@nzyme/utils';

import { onRollupWarning } from './onRollupWarning.js';

export type DevServerOptions = {
    input: string;
    outputDir: string;
    port: number;
    plugins?: InputPluginOption;
    externals?: RegExp[];
    internals?: RegExp[];
};

export function devServerStart(options: DevServerOptions) {
    const rollupOptions = getRollupOptions(options);

    startRollup(rollupOptions);

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

    function getOutputFile(options: DevServerOptions) {
        const inputExtension = path.extname(options.input);
        const inputBase = path.basename(options.input, inputExtension);

        const outputFile = path.join(options.outputDir, `${inputBase}.js`);

        return outputFile;
    }

    function getRollupOptions(options: DevServerOptions): RollupWatchOptions {
        const input: InputOptions = {
            input: options.input,
            plugins: options.plugins,
            external: source => {
                if (options.internals?.some(e => e.test(source))) {
                    return false;
                }

                if (/^node:/.test(source) || /^[\w_-]+$/.test(source)) {
                    // Node built-in modules and third party modules
                    return true;
                }

                if (/node_modules/.test(source)) {
                    return true;
                }

                if (options.externals?.some(e => e.test(source))) {
                    return true;
                }

                return false;
            },
            onwarn: onRollupWarning,
        };

        const output: OutputOptions = {
            format: 'esm',
            dir: options.outputDir,
            sourcemap: true,
        };

        return {
            ...input,
            output,
        };
    }

    function startRollup(options: RollupWatchOptions) {
        const watcher = watch(options);

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
            const outputFile = getOutputFile(options);

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
