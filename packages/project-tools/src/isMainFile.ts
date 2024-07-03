import { pathToFileURL } from 'node:url';

export function isMainFile(meta: ImportMeta) {
    return meta.url === pathToFileURL(process.argv[1]).href;
}
