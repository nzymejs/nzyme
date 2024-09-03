import type { ExternalOption, InputOptions, InputPluginOption, OutputOptions } from 'rollup';

import { onRollupWarning } from './onRollupWarning.js';

export type RollupOptions = {
    input: string;
    outputDir: string;
    plugins?: InputPluginOption;
    external?: ExternalOption;
};

export function getRollupOptions(options: RollupOptions) {
    const input: InputOptions = {
        input: options.input,
        plugins: options.plugins,
        external: options.external,
        onwarn: onRollupWarning,
    };

    const output: OutputOptions = {
        format: 'esm',
        dir: options.outputDir,
        exports: 'named',
        sourcemap: true,
        hoistTransitiveImports: true,
    };

    return {
        input,
        output,
    };
}
