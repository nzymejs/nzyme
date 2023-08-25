import * as path from 'path';

import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

import { unwrapCjsDefaultImport } from '@nzyme/esm';

export interface LambdaFunctionOptions {
    name: string;
    file: string;
    dist: string;
    options?: Omit<lambda.FunctionProps, 'runtime' | 'handler' | 'code'>;
    minify?: boolean;
    define?: Record<string, string>;
}

export async function createLambdaFunction(scope: cdk.Construct, options: LambdaFunctionOptions) {
    const name = options.name;
    const inputFile = options.file;
    const outputDir = path.join(options.dist, `${name}`);
    const outputFile = path.join(outputDir, `index.mjs`);

    const result = await rollup({
        input: inputFile,
        plugins: [
            nodeResolve({
                preferBuiltins: true,
                exportConditions: ['module', 'import', 'node', 'require'],
                resolveOnly: module => {
                    // AWS SDK is included in the lambda runtime, so we don't need to bundle it.
                    if (/^@aws-sdk\/.*/.test(module)) {
                        return false;
                    }

                    return true;
                },
            }),
            unwrapCjsDefaultImport(commonjs)(),
            unwrapCjsDefaultImport(json)(),
            unwrapCjsDefaultImport(esbuild)({
                sourceMap: true,
                define: options.define,
            }),
            sourcemaps(),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.ts'],
                presets: [['@babel/preset-env', { targets: { node: 18 } }]],
                sourceMaps: true,
            }),
            options.minify &&
                terser({
                    mangle: true,
                }),
        ],
    });

    await result.write({
        file: outputFile,
        format: 'esm',
        exports: 'named',
        sourcemap: true,
    });

    return new lambda.Function(scope, name, {
        ...options.options,
        // TODO: no typings for node 18 runtime yet
        runtime: new lambda.Runtime('nodejs18.x', lambda.RuntimeFamily.NODEJS),
        handler: `index.default`,
        code: lambda.Code.fromAsset(outputDir),
        timeout: cdk.Duration.seconds(15 * 60),
    });
}
