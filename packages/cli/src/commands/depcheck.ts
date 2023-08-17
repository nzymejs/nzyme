import { Package } from '@lerna/package';
import { getPackages } from '@lerna/project';
import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { compareVersions } from 'compare-versions';
import consola from 'consola';
import depcheck from 'depcheck';

export default class DepcheckCommand extends Command {
    public static override description = `Checks NPM dependencies`;
    public static override flags = {
        fix: Flags.boolean({
            default: false,
            description: 'Try to fix found issues.',
        }),
    };

    async run() {
        const { flags } = await this.parse(DepcheckCommand);
        return run(flags);
    }
}

interface CommandFlags {
    fix: boolean;
}

async function run(flags: CommandFlags) {
    const cwd = process.cwd();
    const packages = await getPackages(cwd);

    const deps: Record<string, string> = {};
    for (const pkg of packages) {
        if (pkg.dependencies) {
            for (const dep in pkg.dependencies) {
                const version = pkg.dependencies[dep];
                if (!deps[dep]) {
                    deps[dep] = version;
                    continue;
                }

                if (version === '*') {
                    continue;
                }

                if (compareVersions(version, deps[dep])) {
                    deps[dep] = version;
                    continue;
                }
            }
        }
    }

    const promises = packages.map(p => processPackage(p, flags, deps));
    await Promise.all(promises);
}

async function processPackage(pkg: Package, flags: CommandFlags, deps: Record<string, string>) {
    const options = getOptions(pkg);
    const result = await depcheck(pkg.location, options);
    const toWrite: string[] = [];

    let dependencies = pkg.dependencies;
    if (!dependencies) {
        dependencies = {};
        pkg.set('dependencies', dependencies);
    }

    let devDependencies = pkg.devDependencies;
    if (!devDependencies) {
        devDependencies = {};
        pkg.set('devDependencies', devDependencies);
    }

    if (result.dependencies.length) {
        toWrite.push(`\n  Unused dependencies:`);
        for (const dep of result.dependencies) {
            if (flags.fix) {
                delete dependencies[dep];
                toWrite.push(`  ${chalk.green(dep)} (removed)`);
            } else {
                toWrite.push(`  ${chalk.yellow(dep)}`);
            }
        }
    }

    if (result.devDependencies.length) {
        toWrite.push(`\n  Unused dev dependencies:`);
        for (const dep of result.devDependencies) {
            if (flags.fix) {
                delete devDependencies[dep];
                toWrite.push(`  ${chalk.green(dep)} (removed)`);
            } else {
                toWrite.push(`  ${chalk.yellow(dep)}`);
            }
        }
    }

    if (Object.keys(result.missing).length) {
        toWrite.push(`\n  Missing dependencies:`);
        for (const dep in result.missing) {
            if (dep === pkg.name) {
                if (flags.fix && deps[dep]) {
                    delete devDependencies[dep];
                    toWrite.push(`  ${chalk.green(dep)} (removed self reference)`);
                } else {
                    toWrite.push(`  ${chalk.yellow(dep)} (self reference)`);
                }
            } else {
                if (flags.fix && deps[dep]) {
                    dependencies[dep] = deps[dep];
                    toWrite.push(`  ${chalk.green(dep)} (added version ${deps[dep]})`);
                } else {
                    toWrite.push(`  ${chalk.yellow(dep)}`);
                }
            }
        }
    }

    if (result.invalidFiles.length) {
        toWrite.push(`\n  Unabled to parse files:`);
        for (const dep in result.invalidFiles) {
            toWrite.push(`  ${chalk.red(dep)}`);
        }
    }

    if (result.invalidDirs.length) {
        toWrite.push(`\n  Unabled to parse dirs:`);
        for (const dep in result.invalidDirs) {
            toWrite.push(`  ${chalk.red(dep)}`);
        }
    }

    if (toWrite.length) {
        consola.log(`\n${chalk.underline(chalk.magenta(pkg.name))}`);
        for (const line of toWrite) {
            consola.log(line);
        }
    }

    if (flags.fix) {
        // Make sure there are no self references
        delete dependencies[pkg.name];
        delete devDependencies[pkg.name];

        await pkg.serialize();
    }
}

function getOptions(pkg: Package): depcheck.Options {
    const depcheckConfig = pkg.get('depcheck');
    return {
        ignoreBinPackage: false, // ignore the packages with bin entry
        skipMissing: false, // skip calculation of missing dependencies
        ignorePatterns: depcheckConfig?.ignoreFiles ?? [],
        ignoreMatches: depcheckConfig?.ignoreDeps ?? [], //['@oclif/*'],
        parsers: {
            // the target parsers
            '**/*.js': depcheck.parser.es6,
            '**/*.jsx': depcheck.parser.jsx,
            '**/*.ts': depcheck.parser.typescript,
            '**/*.tsx': depcheck.parser.typescript,
            '**/*.scss': depcheck.parser.sass,
            '**/*.sass': depcheck.parser.sass,
            '**/*.vue': depcheck.parser.vue,
        },
        detectors: [
            // the target detectors
            depcheck.detector.requireCallExpression,
            depcheck.detector.importDeclaration,
        ],
        specials: [
            // the target special parsers
            depcheck.special.eslint,
            depcheck.special.jest,
        ],
    };
}
