#!/usr/bin/env node

import v8 from 'v8';

import dotenv from 'dotenv';
import sourceMap from 'source-map-support';
import consola from 'consola';
import oclif from '@oclif/core';

v8.setFlagsFromString('--stack-size=2000');
dotenv.config();
sourceMap.install();
consola.wrapAll();

// In dev mode, always show stack traces
oclif.settings.debug = true;

// Start the CLI
oclif
    .run(process.argv.slice(2), import.meta.url)
    .then(oclif.flush)
    .catch(oclif.Errors.handle);
