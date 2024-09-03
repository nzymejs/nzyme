import type { InputOptions, OutputOptions } from 'rollup';

export type RollupOptions = InputOptions & {
    output: OutputOptions;
};
