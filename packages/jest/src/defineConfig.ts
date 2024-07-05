import type { Config } from '@jest/types';

export function defineConfig<T extends Config.InitialOptions>(config: T) {
    return config;
}
