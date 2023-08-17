declare module 'rollup-plugin-terser' {
    import { Plugin } from 'rollup';

    interface Options {
        mangle?: boolean;
    }

    export function terser(options?: Options): Plugin;
}
