import { url } from 'inspector';

export function isDebugging() {
    return url() !== undefined;
}
