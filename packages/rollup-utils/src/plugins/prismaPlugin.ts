import * as path from 'path';
import { fileURLToPath } from 'url';

import { copy } from 'fs-extra';
import type { Plugin } from 'rollup';

export type PrismaPluginOptions = {
    prismaImport: string;
    importMeta?: ImportMeta;
};

export function prismaPlugin(options: PrismaPluginOptions): Plugin {
    const importMeta = options.importMeta ?? import.meta;
    const prismaPackage = fileURLToPath(importMeta.resolve(options.prismaImport));

    return {
        name: 'prisma',
        resolveId(id) {
            if (id === '@toyclub/database/prisma') {
                return {
                    id: './prisma/index.js',
                    external: 'relative',
                };
            }

            if (id === '.prisma/client/default') {
                return '.prisma/client/default';
            }
        },

        load(id) {
            if (id === '.prisma/client/default') {
                return {
                    code: 'export {};',
                    moduleSideEffects: false,
                };
            }
        },

        async writeBundle(options) {
            const prismaDir = path.dirname(prismaPackage);

            if (options.dir) {
                await copy(prismaDir, path.join(options.dir, 'prisma'));
            }
        },
    };
}
