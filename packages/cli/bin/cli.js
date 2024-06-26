#!/usr/bin/env node

import v8 from 'v8';
import * as path from 'path';
import * as url from 'url';

import dotenv from 'dotenv';
import sourceMap from 'source-map-support';
import consola from 'consola';
import { execute, settings } from '@oclif/core';

v8.setFlagsFromString('--stack-size=2000');
dotenv.config();
sourceMap.install();
consola.wrapAll();

// In dev mode -> use ts-node and dev plugins
process.env.NODE_ENV = 'development';

// In dev mode, always show stack traces
settings.debug = true;
settings.performanceEnabled = true;

// Start the CLI
await execute({ development: true, dir: import.meta.url });
