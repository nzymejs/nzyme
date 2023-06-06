#!/usr/bin/env ts-node --esm

import path from 'path';
import v8 from 'v8';
import * as url from 'url';

import dotenv from 'dotenv';
import sourceMap from 'source-map-support';
import consola from 'consola';
import oclif from '@oclif/core';

import tsnode from 'ts-node';

v8.setFlagsFromString('--stack-size=2000');
dotenv.config();
sourceMap.install();
consola.wrapAll();

const dirname = url.fileURLToPath(new URL('.', import.meta.url));
const project = path.resolve(dirname, '../tsconfig.json');

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development';

tsnode.register({ project });

// (async () => {
//     const oclif = await import('@oclif/core');
//     await oclif.execute({ type: 'esm', development: true, dir: import.meta.url });
// })();

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif
    .run(process.argv.slice(2), import.meta.url)
    .then(oclif.flush)
    .catch(oclif.Errors.handle);
