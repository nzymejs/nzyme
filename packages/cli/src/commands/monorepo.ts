import fs from 'fs';
import path from 'path';

import type { Package } from '@lerna/package';
import { getPackages } from '@lerna/project';
import { Command } from '@oclif/core';
import * as json from 'comment-json';
import merge from 'lodash.merge';
import prettier from 'prettier';

export default class extends Command {
    public static override description = `Runs monorepo setup`;
    public static override flags = {};

    run() {
        return run();
    }
}

interface TsConfig {
    path: string;
    config: Record<string, any>;
    resolved: Record<string, any>;
}

const tsConfigsCache: Record<string, TsConfig | undefined> = {};

async function run() {
    const cwd = process.cwd();
    const packages = await getPackages(cwd);

    const tsconfig = await loadTsConfig(path.resolve(cwd, './tsconfig.json'));
    if (tsconfig) {
        const referencesEsm = await getTsReferences({
            tsconfig: tsconfig,
            dependencies: packages,
            cjs: false,
        });

        const referencesCjs = await getTsReferences({
            tsconfig: tsconfig,
            dependencies: packages,
            cjs: true,
        });

        tsconfig.config.references = [...referencesEsm, ...referencesCjs];
        await saveTsConfig(tsconfig);
    }

    await Promise.all(
        packages.map(pkg =>
            processPackage({
                pkg,
                packages,
            }),
        ),
    );
}

async function processPackage(params: { pkg: Package; packages: Package[] }) {
    const tsconfigEsm = await loadTsConfigForPackage({ pkg: params.pkg, cjs: false });
    const tsconfigCjs = await loadTsConfigForPackage({ pkg: params.pkg, cjs: true });

    if (!tsconfigEsm && !tsconfigCjs) {
        return;
    }

    const dependencyNames = [
        ...Object.keys(params.pkg.dependencies || {}),
        ...Object.keys(params.pkg.devDependencies || {}),
    ];

    const dependencies = dependencyNames
        .map(d => params.packages.find(p => p.name === d)!)
        .filter(Boolean);

    if (tsconfigEsm) {
        const references = await getTsReferences({
            tsconfig: tsconfigEsm,
            dependencies: dependencies,
            cjs: false,
        });

        tsconfigEsm.config.references = references;
        await saveTsConfig(tsconfigEsm);
    }

    if (tsconfigCjs) {
        const references = await getTsReferences({
            tsconfig: tsconfigCjs,
            dependencies: dependencies,
            cjs: true,
        });

        tsconfigCjs.config.references = references;
        await saveTsConfig(tsconfigCjs);
    }
}

async function getTsReferences(params: {
    tsconfig: TsConfig;
    dependencies: Package[];
    cjs: boolean;
}) {
    const references: { path: string }[] = [];

    for (const dep of params.dependencies) {
        const depTsConfig = await loadTsConfigForPackage({ pkg: dep, cjs: params.cjs });

        const disable =
            !depTsConfig ||
            !depTsConfig.resolved.compilerOptions ||
            !depTsConfig.resolved.compilerOptions.composite ||
            depTsConfig.resolved.compilerOptions.noEmit ||
            !(dep.get('main') || dep.get('exports') || dep.get('bin'));

        if (disable) {
            continue;
        }

        let relativePath = path.relative(path.dirname(params.tsconfig.path), depTsConfig.path);
        if (path.sep === '\\') {
            relativePath = relativePath.replace(/\\/g, '/');
        }

        if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
            relativePath = './' + relativePath;
        }

        references.push({
            path: relativePath,
        });
    }

    return references;
}

async function loadTsConfigForPackage(params: { pkg: Package; cjs: boolean }) {
    if (params.cjs) {
        return await loadTsConfig(path.join(params.pkg.location, 'tsconfig.cjs.json'));
    } else {
        return (
            (await loadTsConfig(path.join(params.pkg.location, 'tsconfig.esm.json'))) ||
            (await loadTsConfig(path.join(params.pkg.location, 'tsconfig.json')))
        );
    }
}

async function loadTsConfig(filePath: string) {
    if (!tsConfigsCache[filePath]) {
        try {
            tsConfigsCache[filePath] = await loadTsConfigCore(filePath);
        } catch (e) {
            console.error(`Failed to process ${filePath}`, e);
        }
    }

    return tsConfigsCache[filePath];
}

async function loadTsConfigCore(filePath: string) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    try {
        const configJson = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        const config = json.parse(configJson) as Record<string, any>;
        let resolved = json.parse(configJson) as Record<string, any>;
        let resolvedPath = filePath;

        while (resolved.extends) {
            const extendsPath = path.resolve(path.dirname(resolvedPath), resolved.extends);
            const extendsJson = await fs.promises.readFile(extendsPath, {
                encoding: 'utf8',
            });
            const extendsObj = json.parse(extendsJson);

            delete resolved.extends;

            resolvedPath = extendsPath;
            resolved = merge(extendsObj, resolved);
        }

        const result: TsConfig = {
            path: filePath,
            config: config,
            resolved: resolved,
        };

        return result;
    } catch (e) {
        console.error(`Error reading file ${filePath}`, e);
        throw e;
    }
}

async function saveTsConfig(tsconfig: TsConfig) {
    const prettierConfig = await prettier.resolveConfig(tsconfig.path);

    let configJson = json.stringify(tsconfig.config, undefined, 2);
    configJson = await prettier.format(configJson, {
        ...prettierConfig,
        parser: 'json',
    });

    await fs.promises.writeFile(tsconfig.path, configJson, {
        encoding: 'utf8',
    });
}
